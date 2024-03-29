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

import { log } from "@opstrace/utils";

import { setDestroyConfig, destroyCluster } from "@opstrace/uninstaller";

import * as cli from "./index";
import * as util from "./util";

export async function destroy(): Promise<void> {
  let gcpProjectID: string | undefined;
  let gcpRegion: string | undefined;

  if (cli.CLIARGS.cloudProvider == "gcp") {
    const gcpopts = util.gcpValidateCredFileAndGetDetailOrError();
    gcpProjectID = gcpopts.projectId;
    gcpRegion = util.gcpGetClusterRegion();

    // util.gcpGetClusterRegion() is ignorant so far. deal with that.
    if (gcpRegion == "us-west2") {
      if (cli.CLIARGS.region !== "") {
        log.debug(
          `use GCP region to destroy in from cmdline args: ${cli.CLIARGS.region}`
        );
        gcpRegion = cli.CLIARGS.region;
      } else {
        // when we are here, us-west2 might be pretty wrong, at least emit a
        // warning.
        log.warning(
          "GCP region detection not yet built. See issue 1290. If us-west2 " +
            "is not the GCP region you want to destroy in then set --region <region>"
        );
      }
    }
  }

  let awsRegion: string | undefined;
  if (cli.CLIARGS.cloudProvider == "aws") {
    awsRegion = await util.awsGetClusterRegionWithCmdlineFallback();
  }

  // The "destroy config" concept is deliberately chaotic for now. user-given
  // should only be cloud creds (implicitly), cloud provider and cluster name
  // (both explicitly). In addition to that, the destroy config may contain
  // derived properties.

  setDestroyConfig({
    cloudProvider: cli.CLIARGS.cloudProvider,
    clusterName: cli.CLIARGS.instanceName,
    gcpProjectID: gcpProjectID,
    gcpRegion: gcpRegion,
    awsRegion: awsRegion
  });

  log.info(
    `About to destroy cluster ${cli.CLIARGS.instanceName} (${cli.CLIARGS.cloudProvider}).`
  );
  await util.promptForProceed();
  await destroyCluster(util.smErrorLastResort);
}
