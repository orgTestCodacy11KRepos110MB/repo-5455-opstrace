/**
 * Copyright 2021 Opstrace, Inc.
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

import { all, select, call, Effect } from "redux-saga/effects";
import { ZonedDateTime, ZoneOffset, DateTimeFormatter } from "@js-joda/core";
import { KubeConfig } from "@kubernetes/client-node";

import { getClusterConfig } from "@opstrace/config";
import { log, die, BUILD_INFO } from "@opstrace/utils";
import {
  ControllerResourcesDeploymentStrategy,
  CONTROLLER_NAME,
  deployControllerResources,
  CONFIGMAP_NAME,
  LatestControllerConfigType,
  STORAGE_KEY,
  set as updateControllerConfig,
  upgradeControllerConfigMapToLatest
} from "@opstrace/controller-config";
import { Deployment, K8sResource, updateResource } from "@opstrace/kubernetes";
import { getValidatedGCPAuthOptionsFromFile } from "@opstrace/gcp";
import {
  EnsureInfraExistsResponse,
  ensureAWSInfraExists,
  ensureGCPInfraExists
} from "@opstrace/installer";

import { State } from "./reducer";
import { waitForControllerDeployment } from "./readiness";

const CONTROLLER_IMAGE_DEFAULT = `opstrace/controller:${BUILD_INFO.VERSION_STRING}`;

// Checks if the  cliMetadata.allCLIVersions image tag of the Opstrace
// controller deployment matches the one defined in buildinfo. Older Opstrace
// versions will have an empty cliMetadata field, for these, check the Opstrace
// controller deployment image and check it matches buildinfo.
export function* opstraceInstanceRequiresUpgrade(): Generator<
  Effect,
  boolean,
  any
> {
  const opstraceControllerConfig: LatestControllerConfigType = yield call(
    getOpstraceControllerConfigMap
  );

  const opstraceDeployment: Deployment = yield call(
    getOpstraceControllerDeployment
  );

  const installedControllerVersion =
    opstraceDeployment.spec.spec?.template.spec?.containers[0].image;

  if (opstraceControllerConfig.cliMetadata.allCLIVersions.length > 1) {
    // The latest version the instance was upgraded to was pushed to
    // allCLIVersions in `upgradeControllerConfigMap` function.
    const idx = opstraceControllerConfig.cliMetadata.allCLIVersions.length - 1;
    const lastCLIVersion =
      opstraceControllerConfig.cliMetadata.allCLIVersions[idx].version;

    const installedControllerImageTag = installedControllerVersion
      ?.split(":")
      .pop();
    if (lastCLIVersion !== installedControllerImageTag) {
      die(
        `found Opstrace version mismatch, last CLI version ${lastCLIVersion} in controller configuration does not match installed controller version ${installedControllerImageTag}`
      );
    }

    if (lastCLIVersion !== BUILD_INFO.VERSION_STRING) {
      log.debug(`build info does not match, continue with upgrade`);
      return true;
    }
  }

  if (installedControllerVersion !== CONTROLLER_IMAGE_DEFAULT) {
    log.debug(`controller image does not match, continue with upgrade`);
    return true;
  }

  return false;
}

export function* getOpstraceControllerDeployment(): Generator<
  Effect,
  Deployment,
  State
> {
  const state: State = yield select();
  const { Deployments } = state.kubernetes.cluster;
  const cd = Deployments.resources.find(d => d.name === CONTROLLER_NAME);

  // Exit if controller deployment does not exist.
  if (cd === undefined) {
    die("could not find Opstrace deployment");
  }

  return cd;
}

export function* getOpstraceControllerConfigMap(): Generator<
  Effect,
  LatestControllerConfigType,
  State
> {
  const state: State = yield select();
  const cm = state.kubernetes.cluster.ConfigMaps.resources.find(
    cm => cm.name === CONFIGMAP_NAME
  );
  if (cm === undefined) {
    die(`could not find Opstrace controller config map`);
  }

  const cfgJSON = JSON.parse(cm.spec.data?.[STORAGE_KEY] ?? "");
  if (cfgJSON === "") {
    die(`invalid Opstrace controller config map`);
  }

  log.debug(`controller config: ${JSON.stringify(cfgJSON, null, 2)}`);

  try {
    return upgradeControllerConfigMapToLatest(cfgJSON);
  } catch (e: any) {
    die(`failed to fetch controller configuration: ${e.message}`);
  }
}

// Set the controller deployment image version to the one defined in buildinfo.
export function* upgradeControllerDeployment(config: {
  opstraceClusterName: string;
  kubeConfig: KubeConfig;
}): Generator<Effect, void, any> {
  const opstraceDeployment: Deployment = yield call(
    getOpstraceControllerDeployment
  );
  const installedVersion =
    opstraceDeployment.spec.spec?.template.spec?.containers[0].image;
  log.info(
    `upgrading controller image from ${installedVersion} to ${CONTROLLER_IMAGE_DEFAULT}`
  );

  yield call(deployControllerResources, {
    controllerImage: CONTROLLER_IMAGE_DEFAULT,
    opstraceClusterName: config.opstraceClusterName,
    kubeConfig: config.kubeConfig,
    deploymentStrategy: ControllerResourcesDeploymentStrategy.Update
  });
}

export function* upgradeControllerConfigMap(
  kubeConfig: KubeConfig
): Generator<Effect, void, State> {
  const state: State = yield select();

  log.info("controller upgrade: obtain current controller config");

  const cm = state.kubernetes.cluster.ConfigMaps.resources.find(
    cm => cm.name === CONFIGMAP_NAME
  );
  if (cm === undefined) {
    die(`could not find Opstrace controller config map`);
  }

  const cfgJSON = JSON.parse(cm.spec.data?.[STORAGE_KEY] ?? "");
  if (cfgJSON === "") {
    die(`invalid Opstrace controller config map`);
  }

  log.info("got current controller config map");
  log.debug(`controller config: ${JSON.stringify(cfgJSON, null, 2)}`);

  let cfg: LatestControllerConfigType;
  try {
    cfg = upgradeControllerConfigMapToLatest(cfgJSON);
  } catch (e: any) {
    die(`failed to migrate controller config: ${e.message}`);
  }

  cfg.cliMetadata.allCLIVersions.push({
    version: BUILD_INFO.VERSION_STRING,
    // Current time in UTC using RFC3339 string representation (w/o
    // fractional seconds, with Z tz specififer), e.g.
    // '2021-07-28T15:43:07Z'
    timestamp: ZonedDateTime.now(ZoneOffset.UTC).format(
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
    )
  });

  // Note(Simao): at this point, override any new fields that require reading
  // from the user cluster config.
  // Note(JP): adding my perspective here in my words, because this was a bit
  // mind boggling :). The input for the new controller config cannot only be
  // the old controller config, but also the 'new' user-given Opstrace instance
  // config (UIC, previous UCC) document. We don't need to do a complex,
  // generally working migration here. But we can start small: pick specific
  // params from the UIC and use them. On a case-by-case basis this can be done
  // for individual params
  const ucc = getClusterConfig();
  // custom_auth0_client_id was introduced to be able to configure the Auth0
  // client id. CI uses it to automate the login flow using email and password.
  if (ucc.custom_auth0_client_id) {
    log.info(
      "new controller config: set custom_auth0_domain / " +
        `custom_auth0_client_id to ${ucc.custom_auth0_domain} / ` +
        ucc.custom_auth0_client_id
    );
    cfg.custom_auth0_client_id = ucc.custom_auth0_client_id;
    cfg.custom_auth0_domain = ucc.custom_auth0_domain;
  }
  // custom_dns_name was introduced to be able to move instances to a new domain
  // name
  if (ucc.custom_dns_name) {
    log.info(
      `new controller config: set custom_dns_name to ${ucc.custom_dns_name}`
    );
    cfg.custom_dns_name = ucc.custom_dns_name;
  }

  log.info(`upgraded controller config:\n${JSON.stringify(cfg, null, 2)}`);

  yield call(updateControllerConfig, cfg, kubeConfig);
  log.info("controller config upgrade done");
}

export function* upgradeInfra(cloudProvider: string) {
  switch (cloudProvider) {
    case "aws": {
      const res: EnsureInfraExistsResponse = yield call(ensureAWSInfraExists);
      log.debug(`upgraded infra results: ${JSON.stringify(res)}`);
      break;
    }
    case "gcp": {
      const gcpCredFilePath: string =
        process.env["GOOGLE_APPLICATION_CREDENTIALS"]!;
      const gcpAuthOptions =
        getValidatedGCPAuthOptionsFromFile(gcpCredFilePath);

      const res: EnsureInfraExistsResponse = yield call(
        ensureGCPInfraExists,
        gcpAuthOptions
      );

      log.debug(`upgraded infra results: ${JSON.stringify(res)}`);
      break;
    }
    default:
      die(`cloud provider not supported: ${cloudProvider}`);
  }
}
// Generator< AllEffect<void[]> | CallEffect<void> | any, void, any>
export function* cortexOperatorPreamble(
  kubeConfig: KubeConfig
): Generator<any, void, any> {
  const state: State = yield select();
  const deploy = state.kubernetes.cluster.Deployments.resources.find(
    d => d.name === CONTROLLER_NAME
  );
  if (deploy === undefined) {
    die(`could not find Opstrace controller deployment`);
  }

  const cortexOperator = state.kubernetes.cluster.Deployments.resources.find(
    d =>
      d.namespace === "cortex-operator-system" &&
      d.name === "cortex-operator-controller-mananager"
  );

  if (cortexOperator !== undefined) {
    log.debug(`cortex-operator already deployed, skip ownership transfer`);
    return;
  }

  // disable opstrace controller to be able to transfer ownership of cortex
  // deployment to the cortex-operator; it will be enabled later when the
  // upgrade command deploys the new controller image.
  if (deploy.spec.spec!.replicas! > 0) {
    yield call(stopOpstraceController, deploy, kubeConfig);
    yield call(waitForControllerDeployment, {
      desiredReadyReplicas: undefined
    });
  }

  // Set all the resources the cortex-operator will assume ownership of as
  // immutable. This way the opstrace controller won't try and delete them
  // durint the reconcile loop when it restarts. When the cortex-operator takes
  // ownership of the resource it'll clear the annotation.
  yield call(transferOwnership, state, kubeConfig);
}

async function stopOpstraceController(
  deploy: Deployment,
  kubeConfig: KubeConfig
): Promise<void> {
  deploy.spec.spec!.replicas = 0;
  const resource = new Deployment(
    {
      kind: deploy.spec.kind,
      apiVersion: deploy.spec.apiVersion,
      metadata: {
        name: deploy.spec.metadata?.name,
        namespace: deploy.spec.metadata?.namespace,
        annotations: deploy.spec.metadata?.annotations,
        labels: deploy.spec.metadata?.labels
      },
      spec: deploy.spec.spec
    },
    kubeConfig
  );

  await updateResource(resource);
}
async function setImmutable(r: K8sResource): Promise<void> {
  // Set the resource to immmutable so the opstrace controller doesn't delete it
  // when it reconciles all the resources. when the cortex operator takes
  // ownership of the resource this annotation is deleted.
  r.setImmutable();
  await updateResource(r);
}

function* transferOwnership(
  state: State,
  kubeConfig: KubeConfig
): Generator<any, void, any> {
  const stsToSkip = [
    "memcached" // renamed by cortex-operator
  ];
  const sts = state.kubernetes.cluster.StatefulSets.resources.filter(
    s => s.namespace === "cortex" && !stsToSkip.some(n => n === s.name)
  );
  yield all(sts.map(setImmutable));

  const deployToSkip = ["configs"];
  let deployments = state.kubernetes.cluster.Deployments.resources.filter(
    deploy =>
      deploy.namespace === "cortex" &&
      !deployToSkip.some(n => n === deploy.name)
  );
  deployments = deployments.map(
    d =>
      new Deployment(
        {
          kind: d.spec.kind,
          apiVersion: d.spec.apiVersion,
          metadata: {
            name: d.spec.metadata?.name,
            namespace: d.spec.metadata?.namespace,
            annotations: d.spec.metadata?.annotations,
            labels: d.spec.metadata?.labels
          },
          spec: d.spec.spec
        },
        kubeConfig
      )
  );
  yield all(deployments.map(setImmutable));

  const svcToSkip = ["loki-gossip-ring", "memcached", "configs"];
  const svc = state.kubernetes.cluster.Services.resources.filter(
    svc => svc.namespace === "cortex" && !svcToSkip.some(n => n === svc.name)
  );
  yield all(svc.map(setImmutable));

  const sa = state.kubernetes.cluster.ServiceAccounts.resources.filter(
    sa => sa.namespace === "cortex" && sa.name === "cortex"
  );
  yield all([sa.map(setImmutable)]);

  const cm = state.kubernetes.cluster.ConfigMaps.resources.filter(
    cm => cm.namespace === "cortex" && cm.name === "cortex-config"
  );
  yield all([cm.map(setImmutable)]);

  // Delete the following deployments because we cannot update the match label
  // selector.
  const deleteDeployments = ["distributor", "querier", "query-frontend"];
  deployments = state.kubernetes.cluster.Deployments.resources.filter(
    deploy =>
      deploy.namespace === "cortex" &&
      deleteDeployments.some(n => n === deploy.name)
  );
  yield all(deployments.map(d => d.delete()));
}
