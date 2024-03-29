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

import { delay, call } from "typed-redux-saga";
import { CreateZoneResponse, DNS } from "@google-cloud/dns";
import { Route53 } from "aws-sdk";
import { DNSZone, DNSRecord, Provider } from "./types";
import { getSubdomain } from "./util";
export { getSubdomain } from "./util";
import { DNSClient } from "./opstrace";

import * as GCP from "./gcp";
import * as AWS from "./aws";

import { SECOND, log } from "@opstrace/utils";
import { DeleteZoneResponse } from "@google-cloud/dns/build/src/zone";

export { DNSClient } from "./opstrace";

type Zone = {
  zone: DNSZone | undefined;
  records: DNSRecord[] | undefined;
};

export const getZone = async ({
  provider,
  dnsName,
  dns
}: {
  dnsName: string;
  dns: DNS | Route53;
  provider: Provider;
}): Promise<Zone> => {
  if (provider === "gcp") {
    log.info("look up DNS zone in GCP Cloud DNS, for %s", dnsName);
    return GCP.getZone({ dnsName, dns: dns as DNS });
  }
  if (provider === "aws") {
    log.info("look up DNS zone in AWS Route 53, for %s", dnsName);
    return AWS.getZone({ dnsName, dns: dns as Route53 });
  }
  return Promise.resolve({ zone: undefined, records: undefined });
};

const createZone = async ({
  dnsName,
  dns,
  provider
}: {
  dnsName: string;
  dns: DNS | Route53;
  provider: Provider;
}): Promise<CreateZoneResponse | void | null> => {
  if (provider === "gcp") {
    log.info("create DNS zone in GCP Cloud DNS, for %s", dnsName);
    return GCP.createZone({ dnsName, dns: dns as DNS });
  }
  if (provider === "aws") {
    log.info("create DNS zone in AWS Route 53, for %s", dnsName);
    return AWS.createZone({ dnsName, dns: dns as Route53 });
  }
  return Promise.resolve(null);
};

const deleteZone = async ({
  dnsName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  name,
  dns
}: {
  dnsName: string;
  name?: string;
  dns: DNS | Route53;
}): Promise<DeleteZoneResponse> => {
  log.debug("deleteZone()");
  // only for GCP since opstrace-prelaunch/issues/1225
  return GCP.deleteZone({ dnsName, dns: dns as DNS });
};

export interface DNSRequest {
  opstraceClusterName: string;
  dnsName: string;
  target: Provider;
  dnsProvider: Provider;
}

// Note(JP): rely on this: when this is called, then the target DNS name is
// <something>.opstrace.io, i.e. always use the opstrace DNS service client
// in here.
export function* ensureDNSExists({
  opstraceClusterName,
  dnsName,
  dnsProvider,
  target // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: DNSRequest): Generator<unknown, string, any> {
  const provider = dnsProvider;
  let gcpDNS;
  let awsDNS;

  const opstraceClient: DNSClient = yield call([
    DNSClient,
    DNSClient.getInstance
  ]);

  // quick tranlation of canonical opstrace cluster name into legacy stack name
  const stackName = opstraceClusterName;

  log.info("setting up DNS");

  if (provider === "gcp" || target === "gcp") {
    gcpDNS = new DNS();
  }
  if (provider === "aws" || target === "aws") {
    awsDNS = new Route53();
  }

  const clusters = yield* call([opstraceClient, opstraceClient.getAllEntries]);

  log.debug(
    "DNS API client getAllEntries() yielded: %s",
    JSON.stringify(clusters, null, 2)
  );

  // @ts-ignore either type of opstraceClient.GetAll is wrong or we are doing something wrong here
  if (!clusters.find(e => e["clustername"] == opstraceClusterName)) {
    log.debug(
      "cluster name not found in opstraceClient.GetAll() response, call opstraceClient.Create()"
    );
    log.info(
      `Try to create entry for ${opstraceClusterName} in the Opstrace DNS service`
    );
    yield call([opstraceClient, opstraceClient.create], opstraceClusterName);
  }
  // Ensure subzone exists
  const subZoneName = getSubdomain({ stackName, dnsName });

  while (true) {
    const subZone: Zone = yield call(getZone, {
      dnsName: subZoneName,
      dns: target === "aws" ? (awsDNS as Route53) : (gcpDNS as DNS),
      provider: target
    });

    yield delay(1 * SECOND);

    // Create the subZone
    if (!subZone.zone) {
      try {
        yield call(createZone, {
          dnsName: subZoneName,
          dns: target === "aws" ? (awsDNS as Route53) : (gcpDNS as DNS),
          provider: target
        });
      } catch (err: any) {
        if (!err.code || (err.code && err.code !== 409)) {
          throw err;
        } else {
          log.info("ignore: %s", err.message);
        }
      }
      continue;
    }

    // Look up NS record in this DNS zone (extract name servers!)
    const subdomainNsRecord = subZone.records?.find(r => r.type === "NS");

    if (!subdomainNsRecord?.rrdatas) {
      // Note(JP): this seems pathological -- when we cannot pass name servers
      // to the Opstrace DNS service, then the Opstrace DNS service cannot make
      // the connection to the user's name servers.
      throw Error("Could not detect NS records for DNS zone");
    } else {
      log.info(
        "pass authoritative name servers to Opstrace DNS service: %s",
        JSON.stringify(subdomainNsRecord.rrdatas, null, 2)
      );
      yield call(
        [opstraceClient, opstraceClient.addNameservers],
        stackName,
        subdomainNsRecord.rrdatas
      );
    }
    return subZoneName;
  }
}

// note(jp): quickndirtily changed to only support GCP since
// opstrace-prelaunch/issues/1225. Delete the managed zone in the user's cloud
// infrastructure. For example, this is a GCP Cloud DNS "managed zone" for
// *.foo.opstrace.io.
// `dnsName` is expected to be <instance_name>.opstrace.io
export function* destroyDNSZone(
  dnsName: string
): Generator<unknown, void, any> {
  const gcpDNS = new DNS();
  const z: Zone = yield call(getZone, {
    dnsName: dnsName,
    dns: gcpDNS as DNS,
    provider: "gcp" as "gcp" | "aws"
  });

  if (z.zone) {
    try {
      yield call(deleteZone, {
        dnsName: dnsName,
        name: z.zone.name,
        dns: gcpDNS as DNS
      });
    } catch (err: any) {
      if (err.code && err.code === 404) {
        log.info("ignore: %s", err.message);
      } else {
        throw err;
      }
    }
  }
}
