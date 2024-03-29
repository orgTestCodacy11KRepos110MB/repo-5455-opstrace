/**
 * Copyright 2020 Opstrace, Inc.
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

import { strict as assert } from "assert";

import AWS from "aws-sdk";

import { log, rndFloatFromInterval } from "@opstrace/utils";
import { AWSApiError } from "./types";
import { PromiseResult } from "aws-sdk/lib/request";

// supposed to be a tidy immutable singleton in the future: write/set once,
// read/consume from anywhere w/o the need to explicitly pass this through
// function arguments.
let awsRegion: string | undefined;

export function setAWSRegion(r: string): void {
  if (awsRegion !== undefined) {
    throw new Error("setAWSRegion() was already called before");
  }
  awsRegion = r;
}

function getAWSRegion() {
  if (awsRegion === undefined) {
    throw new Error("call setAWSRegion() first");
  }
  return awsRegion;
}

// Adjust global (singleton) AWS client config
// `AWS.config` *is* "the global configuration object singleton instance", see
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS.html#config-property

AWS.config.update({
  httpOptions: {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#httpOptions-property
    // TCP connect() timeout in milliseconds. Trade-off: 1) for good UX keep this
    // small to keep user informed about progress, and also to actually have a
    // certain rate of retrying which sometimes resolves network path hiccups.
    // 2) when networks are super loaded and slow waiting for a long time might
    // lead to success. Between (1) and (2) stay below 10 seconds.
    connectTimeout: 6000,
    // Documented with "milliseconds of inactivity on the socket". That is,
    // this cannot be used to define a guaranteed upper limit for the duration
    // of an HTTP request/response cycle (that's good, though, just important)
    // to be aware of.
    timeout: 30000
  },
  // maxRetries, to be sure, should be set per service, seemingly.
  retryDelayOptions: {
    customBackoff: function (retryCount: number, err: Error | undefined) {
      // Return the amount of time to delay, in milliseconds. Custom
      // implementation, primary reason: use this to log transient errors.
      // Secondary reason: use a custom and reasonably simple retry delay calc
      // strategy for starters. Assume that HTTP requests are fired off in the
      // context of micro tasks which retry "forever", and otherwise apply a
      // global timeout -- i.e, implement a 'low' upper bound.

      // simple jitter: smear out, between factor 1 and 2.
      let waitSec = rndFloatFromInterval(1.0, 2.0) * 1.6 ** retryCount;

      // Implement upper bond.
      if (waitSec > 30) {
        waitSec = 30;
      }

      if (!err) {
        // Code path allows this, but this happens rarely or never, check old
        // logs.
        log.debug(
          "aws-sdk-js request failed (attempt %s): no err information (retry in %s seconds)",
          retryCount,
          waitSec.toFixed(2)
        );
        return waitSec * 1000;
      }

      //@ts-ignore: .code is sometimes set :)
      if (err && err.code === "TimeoutError") {
        // For the frequent real-world scenario of a TCP connect() timeout.
        // Message is "Socket timed out without establishing a connection".
        // Info-log that so that the reason for delays is not hidden from
        // users. Update(JP): sadly, this _also_ hits in for the recv() /read
        // timeout (when the HTTP request was sent, but the response didn't
        // arrive in a timely fashion; sadly also a misleading error message:
        // "Connection timed out after 30000ms"

        log.info(
          "AWS API request failed (attempt %s): %s (retry in %s seconds)",
          retryCount,
          err.message,
          waitSec.toFixed(2)
        );

        return waitSec * 1000;
      }

      // Ideally we'd log the request URL and method. The AWS SDK throws away
      // the request information when constructing the error object here:
      // https://github.com/aws/aws-sdk-js/blob/909cfe3dad38a21e3a4236d7d2cfa86a81681520/lib/util.js#L904

      // All other cases: might sadly be non-retryable errors, also see
      // https://github.com/opstrace/opstrace/issues/66
      log.debug(
        "aws-sdk-js request failed (attempt %s): %s: %s (retryable, according to sdk: %s), retry in %s seconds",
        retryCount,
        err.name,
        err.message,
        //@ts-ignore: we want to log that also if undefined
        err.retryable,
        waitSec.toFixed(2)
      );

      return waitSec * 1000;
    }
  }
});

// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/logging-sdk-calls.html
// `AWS.config.logger` needs to be set to an object providing the `log` method.
// Do so, direct it to our winston log system.
const awsLoggerBridge = {
  log: (msg: string) => {
    log.debug("aws sdk: %s", msg);
  }
};
AWS.config.logger = awsLoggerBridge;

/**
 * AWS client objects representing current config (plan: make use of singleton
 * config object representing user-given config)
 */
export function autoScalingClient(): AWS.AutoScaling {
  return new AWS.AutoScaling({
    region: getAWSRegion(),
    maxRetries: 10
  });
}

export function ec2c(): AWS.EC2 {
  return new AWS.EC2({
    region: getAWSRegion(),
    maxRetries: 10
  });
}

export function iamClient(): AWS.IAM {
  return new AWS.IAM({
    region: getAWSRegion(),
    maxRetries: 10
  });
}

export function eksClient(regionOverride?: string): AWS.EKS {
  let r: string;
  if (regionOverride !== undefined) {
    r = regionOverride;
  } else {
    r = getAWSRegion();
  }
  return new AWS.EKS({
    region: r,
    maxRetries: 15
  });
}

export function rdsClient(): AWS.RDS {
  return new AWS.RDS({
    region: getAWSRegion(),
    maxRetries: 10
  });
}

export function r53Client(): AWS.Route53 {
  return new AWS.Route53({
    region: getAWSRegion(),
    maxRetries: 10
  });
}

export function s3Client(): AWS.S3 {
  return new AWS.S3({
    region: getAWSRegion(),
    maxRetries: 10
  });
}

export function elbClient(): AWS.ELBv2 {
  return new AWS.ELBv2({
    region: getAWSRegion(),
    maxRetries: 10
  });
}

export function stsClient(): AWS.STS {
  return new AWS.STS({
    region: getAWSRegion(),
    // "stsRegionalEndpoints ('legacy'|'regional') — whether to send sts request
    // to global endpoints or regional endpoints. Defaults to 'legacy'."
    // also see issue opstrace-prelaunch/issues/2001
    stsRegionalEndpoints: "regional",
    maxRetries: 10
  });
}

/**
 * Wait for promise to resolve.
 *
 * If promise is rejected then inspect the error and translate it into
 * an object of type AWSApiError if applicable -- which can then cleanly
 * be detected and handled in consumers.
 *
 * @param prom
 */
export async function awsPromErrFilter<D, E>(
  prom: Promise<PromiseResult<D, E>>
): Promise<D> {
  try {
    return await prom;
  } catch (e: any) {
    throwIfAWSAPIError(e);
    throw e;
  }
}

/**
 *
 * Try to detect an AWS HTTP API error, and translate it into a
 * TS-friendly error representing such.
 *
 * Also see https://github.com/aws/aws-sdk-js/issues/2611
 */
export function throwIfAWSAPIError(err: Error): void {
  //log.debug("err detail: %s", JSON.stringify(err, null, 2));
  //@ts-ignore: property originalError does not exist on type Error.
  const awserr = err.originalError;
  //@ts-ignore: property statusCode does not exist on type Error.
  const httpsc = err.statusCode;
  if (awserr === undefined && httpsc === undefined) {
    log.debug("this does not appear to be an AWS API error");
    return;
  }

  // Try to log as much original error detail as possible.
  if (awserr !== undefined) {
    log.debug("err.originalError: %s", JSON.stringify(awserr, null, 2));
  }

  // I tested this out: code corresponds to name and is the AWS error 'type',
  // for example `DependencyViolation`. `statusCode` should be set for all
  // errors communicated in an HTTP error response.
  let msg = `${err.name}: ${err.message}`;

  if (httpsc !== undefined) {
    msg = `${msg} (HTTP status code: ${httpsc})`;
  }

  throw new AWSApiError(msg, err.name, httpsc);
}

export function getWaitTimeSeconds(cycle: number): number {
  // various callers rely on 0 wait time in cycle 1 (1 corresponds to the first
  // cycle).
  if (cycle == 1) {
    return 0;
  }
  // Note(JP): more sophisticated strategy later.
  return 10;
}

export const getTagFilter = (
  clusterName: string
): {
  Name: string;
  Values: string[];
} => ({
  Name: `tag:opstrace_cluster_name`,
  Values: [clusterName]
});

export const getTags = (clusterName: string): AWS.EC2.Tag[] => [
  {
    Key: `opstrace_cluster_name`,
    Value: clusterName
  },
  {
    Key: `kubernetes.io/cluster/${clusterName}`,
    Value: "shared"
  }
];

export const tagResource = ({
  clusterName,
  resourceId,
  tags
}: {
  clusterName: string;
  resourceId: string;
  tags?: AWS.EC2.Tag[];
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const additionalTags = tags ? tags : [];
    ec2c().createTags(
      {
        Tags: [...getTags(clusterName), ...additionalTags],
        Resources: [resourceId]
      },
      err => {
        if (err) {
          reject(err);
        }
        resolve();
      }
    );
  });
};

export const untagResource = ({
  name,
  resourceId
}: {
  name: string;
  resourceId: string;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    ec2c().deleteTags(
      {
        Tags: getTags(name),
        Resources: [resourceId]
      },
      err => {
        if (err) {
          reject(err);
        }
        resolve();
      }
    );
  });
};

export const getAccountId = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const sts = new AWS.STS();
    sts.getCallerIdentity({}, (err, data) => {
      if (err) {
        reject(err);
      }
      assert(data.Account);
      resolve(data.Account);
    });
  });
};

export function generateKubeconfigStringForEksCluster(
  region: string,
  cluster: AWS.EKS.Cluster
): string {
  return `apiVersion: v1
preferences: {}
kind: Config

clusters:
- cluster:
    server: ${cluster.endpoint}
    certificate-authority-data: ${cluster.certificateAuthority?.data}
  name: ${cluster.name}

contexts:
- context:
    cluster: ${cluster.name}
    user: ${cluster.name}
  name: ${cluster.name}

current-context: ${cluster.name}

users:
- name: ${cluster.name}
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1alpha1
      command: aws
      args:
      - --region
      - ${region}
      - eks
      - get-token
      - --cluster-name
      - ${cluster.name}
`;
}
