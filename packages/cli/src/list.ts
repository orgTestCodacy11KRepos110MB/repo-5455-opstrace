/**
 * Copyright 2020-2021 Opstrace, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EKS } from "aws-sdk";

import { log, die } from "@opstrace/utils";

import { getAllGKEClusters, getGcpProjectId } from "@opstrace/gcp";

import { awsPromErrFilter, AWSApiError, eksClient } from "@opstrace/aws";

import * as cli from "./index";
import * as util from "./util";

export async function list(): Promise<void> {
  if (cli.CLIARGS.cloudProvider == "gcp") {
    util.gcpValidateCredFileAndGetDetailOrError();
    await listGKEClusters();
    return;
  }

  if (cli.CLIARGS.cloudProvider == "aws") {
    let clusters: EKSOpstraceClusterRegionRelation[] = [];
    try {
      clusters = await EKSgetOpstraceClustersAcrossManyRegions();
    } catch (e: any) {
      if (e instanceof ListEksInRegionError) {
        // Assume (rely on) that error details were already logged, in a useful
        // way for the admin/user to understand what went wrong.
        die(`Could not look up clusters in region ${e.region}.`);
      }

      throw e;
    }

    if (clusters.length > 0) {
      for (const c of clusters)
        process.stdout.write(`${c.opstraceClusterName}\n`);
    }
  }
}

export class ListEksInRegionError extends Error {
  public region: string;
  public message: string;
  public error: Error;
  constructor(message: string, region: string, error: Error) {
    super(message);
    this.region = region;
    this.error = error;
    this.message = message;
    Error.captureStackTrace(this, ListEksInRegionError);
  }
}

export interface EKSOpstraceClusterRegionRelation {
  awsRegion: string;
  opstraceClusterName: string;
  eksCluster: EKS.Cluster;
}

/**
 * List Opstrace clusters in AWS EKS across many AWS regions. Note: this can
 * only discover those clusters that the currently configured AWS credentials
 * can see.
 *
 * This is expected to throw `ListEksInRegionError` when the lookup in a
 * specific region fails.
 */
export async function EKSgetOpstraceClustersAcrossManyRegions(): Promise<
  EKSOpstraceClusterRegionRelation[]
> {
  // Make it so that the AWS / EKS region is not a required input parameter for
  // the `opstrace list` operation. Parallelize/batch http requests. Is a bit
  // costly but still fine (especially given the UX win).

  // Enumerate only AWS global regions; omit "local zones" and cn-* regions.
  //   https://aws.amazon.com/about-aws/global-infrastructure/localzones/
  //   https://www.amazonaws.cn/en/about-aws/regional-product-services/
  //
  // Discuss adding cn-* regions: https://github.com/opstrace/opstrace/issues/1202

  const regions = [
    "af-south-1",
    "ap-east-1",
    "ap-northeast-1",
    "ap-northeast-2",
    "ap-northeast-3",
    "ap-south-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ca-central-1",
    "eu-central-1",
    "eu-north-1",
    "eu-south-1",
    "eu-west-1",
    "eu-west-2",
    "eu-west-3",
    "me-south-1",
    "sa-east-1",
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2"
  ];

  // Fetch, for all regions concurrently.
  const actors: Promise<EKSOpstraceClusterRegionRelation[]>[] = [];
  for (const region of regions) {
    actors.push(EKSgetOpstraceClustersInRegion(region));
  }

  // Promise.all resolves once all promises in the array resolve, or rejects as
  // soon as one of them rejects. It either resolves with an array of all
  // resolved values, or rejects with a single error.
  // This may throw ListEksInRegionError, handle in caller.
  const ocnLists: EKSOpstraceClusterRegionRelation[][] = await Promise.all(
    actors
  );

  log.debug("listOpstraceClustersOnEKS(): done");

  // This is an array of arrays, and the individual items in the inner arrays
  // are `ClusterRegionRelation` objects: the canonical Opstrace cluster names,
  // plus region information. Return all those objects, flat.
  return ocnLists.flat();
}

/**
 * Identify Opstrace clusters in a specific AWS region. Do that by first
 * issuing a listClusters() API call and then by issuing a `describeCluster()`
 * API call per returned EKS cluster.
 *
 * This function is expected to throw a `ListEksInRegionError` for AWS
 * API call failures.
 */
async function EKSgetOpstraceClustersInRegion(
  region: string
): Promise<EKSOpstraceClusterRegionRelation[]> {
  const ekscl = eksClient(region);

  // TODO: don't worry about pagination yet, this may miss opstrace clusters
  // when there are more than 100 EKS clusters returned, see
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EKS.html#listClusters-property

  log.debug("eks.listClusters() for region %s", region);

  let result: EKS.ListClustersResponse;
  try {
    result = await awsPromErrFilter(ekscl.listClusters().promise());
  } catch (e: any) {
    if (e instanceof AWSApiError) {
      if (e.statusCode === 403) {
        // UnrecognizedClientException: The security token included in the
        // request is invalid. (HTTP status code: 403)
        log.info(
          "listing EKS clusters for region %s failed with a 403 error (not authorized), skip region",
          region
        );
        return [];
      }

      throw e;
    }

    // After N retries, this is expected to be hit for example for
    // TimeoutError: Socket timed out without establishing a connection

    log.error(
      "eks.listClusters() for region %s failed unexpectedly with error: %s",
      region,
      e.message
    );

    throw new ListEksInRegionError(
      `error during listClusters() for region ${region}: ${e.code}: ${e.message}`,
      region,
      e
    );
  }

  log.debug(
    "eks.listClusters() for region %s returned %s EKS clusters",
    region,
    result.clusters?.length
  );

  const opstraceClusters: EKSOpstraceClusterRegionRelation[] = [];
  const opstraceClusterNames: string[] = [];
  for (const EKSclusterName of result.clusters as string[]) {
    let dcresp;
    try {
      dcresp = await awsPromErrFilter(
        ekscl.describeCluster({ name: EKSclusterName }).promise()
      );
    } catch (e: any) {
      if (e instanceof AWSApiError) {
        throw new ListEksInRegionError(
          `AWS API error during describeCluster(${EKSclusterName}) for region ${region}: ${e.message}`,
          region,
          e
        );
      }
      throw e;
    }
    const ocn = dcresp.cluster?.tags?.opstrace_cluster_name;

    if (ocn !== undefined) {
      // Only proceed processing those clusters that have the
      // opstrace_cluster_name label set; the definite signal that this
      // EKS cluster is part of an Opstrace cluster.
      opstraceClusters.push({
        awsRegion: region,
        opstraceClusterName: ocn,
        // `dcresp.cluster` is known to not be undefined, because `ocn` is not
        // undefined. That is why this non-null assertion is OK here.
        eksCluster: dcresp.cluster!
      });
      opstraceClusterNames.push(ocn);
    }
  }

  if (opstraceClusters.length > 0) {
    log.info(
      `Found Opstrace clusters in AWS ${region}: ${opstraceClusterNames.join(
        ", "
      )}`
    );
  }

  return opstraceClusters;
}

/**
 * List Opstrace clusters in GKE (GCP), those that the currently configured
 * credentials can see.
 * Goal: list for all possible regions/locations, also see
 * opstrace-prelaunch/issues/1033
 */
async function listGKEClusters() {
  const pid: string = await getGcpProjectId();
  log.debug("GCP project ID: %s", pid);
  const clusters = await getAllGKEClusters();

  if (!clusters) {
    return;
  }

  for (const c of clusters) {
    const ocn = c.resourceLabels?.opstrace_cluster_name;
    if (ocn !== undefined) {
      process.stdout.write(`${ocn}\n`);
    }
  }
}
