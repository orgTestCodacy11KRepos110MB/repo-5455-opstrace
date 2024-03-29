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

import { KubeConfig } from "@kubernetes/client-node";
import { strict as assert } from "assert";
import {
  ResourceCollection,
  ServiceAccount,
  ClusterRole,
  ClusterRoleBinding,
  RoleBinding,
  Service,
  V1ClusterissuerResource,
  CustomResourceDefinition,
  Role,
  Deployment,
  certificates,
  certificaterequests,
  challenges,
  clusterIssuers,
  issuers,
  orders
} from "@opstrace/kubernetes";
import { getControllerConfig } from "../../helpers";
import { State } from "../../reducer";
import { DockerImages, getImagePullSecrets } from "@opstrace/controller-config";

export function CertManagerResources(
  state: State,
  kubeConfig: KubeConfig,
  namespace: string
): ResourceCollection {
  const collection = new ResourceCollection();
  //@ts-ignore: some of the versions in the CRD don't align with the extenstions/v1 CustomResourceDefinition.
  collection.add(new CustomResourceDefinition(certificates, kubeConfig));
  //@ts-ignore: some of the versions in the CRD don't align with the extenstions/v1 CustomResourceDefinition.
  collection.add(new CustomResourceDefinition(certificaterequests, kubeConfig));
  //@ts-ignore: some of the versions in the CRD don't align with the extenstions/v1 CustomResourceDefinition.
  collection.add(new CustomResourceDefinition(challenges, kubeConfig));
  collection.add(new CustomResourceDefinition(clusterIssuers, kubeConfig));
  collection.add(new CustomResourceDefinition(issuers, kubeConfig));
  //@ts-ignore: some of the versions in the CRD don't align with the extenstions/v1 CustomResourceDefinition.
  collection.add(new CustomResourceDefinition(orders, kubeConfig));

  const { target, region, aws, gcp } = getControllerConfig(state);

  let dns01 = {};

  if (target === "gcp") {
    if (!gcp) {
      throw new Error(
        "require gcp config to set up dns challenge for certManager"
      );
    }

    dns01 = {
      cloudDNS: {
        project: gcp.projectId
      }
    };
  }

  if (target === "aws") {
    if (!aws) {
      throw new Error(
        "require aws config to set up dns challenge for certManager"
      );
    }
    dns01 = {
      route53: {
        region,
        role: aws.certManagerRoleArn
      }
    };
  }

  //
  // Self signed Issuers will issue self signed certificates. This is useful
  // when building PKI within Kubernetes, or as a means to generate a root CA
  // for use with the CA Issuer. A self-signed Issuer contains no additional
  // configuration fields.
  //
  collection.add(
    new V1ClusterissuerResource(
      {
        apiVersion: "cert-manager.io/v1",
        kind: "ClusterIssuer",
        metadata: {
          name: "selfsigning-issuer"
        },
        spec: {
          selfSigned: {}
        }
      },
      kubeConfig
    )
  );

  // Cluster issuer: Make available to application and per-tenant namespaces
  collection.add(
    new V1ClusterissuerResource(
      {
        apiVersion: "cert-manager.io/v1",
        kind: "ClusterIssuer",
        metadata: {
          name: "letsencrypt-prod"
        },
        spec: {
          acme: {
            server: "https://acme-v02.api.letsencrypt.org/directory",
            email: "mat@opstrace.com",
            privateKeySecretRef: {
              name: "letsencrypt-prod"
            },
            solvers: [
              {
                selector: {},
                dns01: dns01
              }
            ]
          }
        }
      },
      kubeConfig
    )
  );

  // Cluster issuer: Make available to application and per-tenant namespaces
  collection.add(
    new V1ClusterissuerResource(
      {
        apiVersion: "cert-manager.io/v1",
        kind: "ClusterIssuer",
        metadata: {
          name: "letsencrypt-staging"
        },
        spec: {
          acme: {
            server: "https://acme-staging-v02.api.letsencrypt.org/directory",
            email: "mat@opstrace.com",
            privateKeySecretRef: {
              name: "letsencrypt-staging"
            },
            solvers: [
              {
                selector: {},
                dns01: dns01
              }
            ]
          }
        }
      },
      kubeConfig
    )
  );

  collection.add(
    new ServiceAccount(
      {
        apiVersion: "v1",
        kind: "ServiceAccount",
        metadata: {
          name: "cert-manager-cainjector",
          namespace,
          labels: {
            app: "cainjector",
            "app.kubernetes.io/component": "cainjector",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cainjector"
          }
        }
      },
      kubeConfig
    )
  );

  let annotations = {};
  if (target == "gcp") {
    assert(gcp?.certManagerServiceAccount);
    annotations = {
      "iam.gke.io/gcp-service-account": gcp.certManagerServiceAccount
    };
  }

  collection.add(
    new ServiceAccount(
      {
        apiVersion: "v1",
        kind: "ServiceAccount",
        metadata: {
          name: "cert-manager",
          namespace,
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          annotations: annotations
        }
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cainjector",
            "app.kubernetes.io/component": "cainjector",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cainjector"
          },
          name: "cert-manager-cainjector"
        },
        rules: [
          {
            apiGroups: ["cert-manager.io"],
            resources: ["certificates"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: [""],
            resources: ["secrets"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: [""],
            resources: ["events"],
            verbs: ["get", "create", "update", "patch"]
          },
          {
            apiGroups: ["admissionregistration.k8s.io"],
            resources: [
              "validatingwebhookconfigurations",
              "mutatingwebhookconfigurations"
            ],
            verbs: ["get", "list", "watch", "update"]
          },
          {
            apiGroups: ["apiregistration.k8s.io"],
            resources: ["apiservices"],
            verbs: ["get", "list", "watch", "update"]
          },
          {
            apiGroups: ["apiextensions.k8s.io"],
            resources: ["customresourcedefinitions"],
            verbs: ["get", "list", "watch", "update"]
          },
          {
            apiGroups: ["auditregistration.k8s.io"],
            resources: ["auditsinks"],
            verbs: ["get", "list", "watch", "update"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-issuers"
        },
        rules: [
          {
            apiGroups: ["cert-manager.io"],
            resources: ["issuers", "issuers/status"],
            verbs: ["update"]
          },
          {
            apiGroups: ["cert-manager.io"],
            resources: ["issuers"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: [""],
            resources: ["secrets"],
            verbs: ["get", "list", "watch", "create", "update", "delete"]
          },
          {
            apiGroups: [""],
            resources: ["events"],
            verbs: ["create", "patch"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-clusterissuers"
        },
        rules: [
          {
            apiGroups: ["cert-manager.io"],
            resources: ["clusterissuers", "clusterissuers/status"],
            verbs: ["update"]
          },
          {
            apiGroups: ["cert-manager.io"],
            resources: ["clusterissuers"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: [""],
            resources: ["secrets"],
            verbs: ["get", "list", "watch", "create", "update", "delete"]
          },
          {
            apiGroups: [""],
            resources: ["events"],
            verbs: ["create", "patch"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-certificates"
        },
        rules: [
          {
            apiGroups: ["cert-manager.io"],
            resources: [
              "certificates",
              "certificates/status",
              "certificaterequests",
              "certificaterequests/status"
            ],
            verbs: ["update"]
          },
          {
            apiGroups: ["cert-manager.io"],
            resources: [
              "certificates",
              "certificaterequests",
              "clusterissuers",
              "issuers"
            ],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: ["cert-manager.io"],
            resources: [
              "certificates/finalizers",
              "certificaterequests/finalizers"
            ],
            verbs: ["update"]
          },
          {
            apiGroups: ["acme.cert-manager.io"],
            resources: ["orders"],
            verbs: ["create", "delete", "get", "list", "watch"]
          },
          {
            apiGroups: [""],
            resources: ["secrets"],
            verbs: ["get", "list", "watch", "create", "update", "delete"]
          },
          {
            apiGroups: [""],
            resources: ["events"],
            verbs: ["create", "patch"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-orders"
        },
        rules: [
          {
            apiGroups: ["acme.cert-manager.io"],
            resources: ["orders", "orders/status"],
            verbs: ["update"]
          },
          {
            apiGroups: ["acme.cert-manager.io"],
            resources: ["orders", "challenges"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: ["cert-manager.io"],
            resources: ["clusterissuers", "issuers"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: ["acme.cert-manager.io"],
            resources: ["challenges"],
            verbs: ["create", "delete"]
          },
          {
            apiGroups: ["acme.cert-manager.io"],
            resources: ["orders/finalizers"],
            verbs: ["update"]
          },
          {
            apiGroups: [""],
            resources: ["secrets"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: [""],
            resources: ["events"],
            verbs: ["create", "patch"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-challenges"
        },
        rules: [
          {
            apiGroups: ["acme.cert-manager.io"],
            resources: ["challenges", "challenges/status"],
            verbs: ["update"]
          },
          {
            apiGroups: ["acme.cert-manager.io"],
            resources: ["challenges"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: ["cert-manager.io"],
            resources: ["issuers", "clusterissuers"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: [""],
            resources: ["secrets"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: [""],
            resources: ["events"],
            verbs: ["create", "patch"]
          },
          {
            apiGroups: [""],
            resources: ["pods", "services"],
            verbs: ["get", "list", "watch", "create", "delete"]
          },
          {
            apiGroups: ["extensions"],
            resources: ["ingresses"],
            verbs: ["get", "list", "watch", "create", "delete", "update"]
          },
          {
            apiGroups: ["route.openshift.io"],
            resources: ["routes/custom-host"],
            verbs: ["create"]
          },
          {
            apiGroups: ["acme.cert-manager.io"],
            resources: ["challenges/finalizers"],
            verbs: ["update"]
          },
          {
            apiGroups: [""],
            resources: ["secrets"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: ["networking.k8s.io"],
            resources: ["ingresses"],
            verbs: ["get", "list", "watch", "create", "delete", "update"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-ingress-shim"
        },
        rules: [
          {
            apiGroups: ["cert-manager.io"],
            resources: ["certificates", "certificaterequests"],
            verbs: ["create", "update", "delete"]
          },
          {
            apiGroups: ["cert-manager.io"],
            resources: [
              "certificates",
              "certificaterequests",
              "issuers",
              "clusterissuers"
            ],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: ["extensions"],
            resources: ["ingresses"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: ["extensions"],
            resources: ["ingresses/finalizers"],
            verbs: ["update"]
          },
          {
            apiGroups: [""],
            resources: ["events"],
            verbs: ["create", "patch"]
          },
          {
            apiGroups: ["networking.k8s.io"],
            resources: ["ingresses"],
            verbs: ["get", "list", "watch"]
          },
          {
            apiGroups: ["networking.k8s.io"],
            resources: ["ingresses/finalizers"],
            verbs: ["update"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager",
            "rbac.authorization.k8s.io/aggregate-to-admin": "true",
            "rbac.authorization.k8s.io/aggregate-to-edit": "true",
            "rbac.authorization.k8s.io/aggregate-to-view": "true"
          },
          name: "cert-manager-view"
        },
        rules: [
          {
            apiGroups: ["cert-manager.io"],
            resources: ["certificates", "certificaterequests", "issuers"],
            verbs: ["get", "list", "watch"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRole(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRole",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager",
            "rbac.authorization.k8s.io/aggregate-to-admin": "true",
            "rbac.authorization.k8s.io/aggregate-to-edit": "true"
          },
          name: "cert-manager-edit"
        },
        rules: [
          {
            apiGroups: ["cert-manager.io"],
            resources: ["certificates", "certificaterequests", "issuers"],
            verbs: ["create", "delete", "deletecollection", "patch", "update"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRoleBinding",
        metadata: {
          labels: {
            app: "cainjector",
            "app.kubernetes.io/component": "cainjector",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cainjector"
          },
          name: "cert-manager-cainjector"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "ClusterRole",
          name: "cert-manager-cainjector"
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "cert-manager-cainjector",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRoleBinding",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-issuers"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "ClusterRole",
          name: "cert-manager-controller-issuers"
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "cert-manager",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRoleBinding",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-clusterissuers"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "ClusterRole",
          name: "cert-manager-controller-clusterissuers"
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "cert-manager",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRoleBinding",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-certificates"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "ClusterRole",
          name: "cert-manager-controller-certificates"
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "cert-manager",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRoleBinding",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-orders"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "ClusterRole",
          name: "cert-manager-controller-orders"
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "cert-manager",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRoleBinding",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-challenges"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "ClusterRole",
          name: "cert-manager-controller-challenges"
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "cert-manager",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new ClusterRoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "ClusterRoleBinding",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager-controller-ingress-shim"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "ClusterRole",
          name: "cert-manager-controller-ingress-shim"
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "cert-manager",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new Role(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "Role",
        metadata: {
          labels: {
            app: "cainjector",
            "app.kubernetes.io/component": "cainjector",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cainjector"
          },
          name: "cert-manager-cainjector:leaderelection",
          namespace: "kube-system"
        },
        rules: [
          {
            apiGroups: [""],
            resourceNames: [
              "cert-manager-cainjector-leader-election",
              "cert-manager-cainjector-leader-election-core"
            ],
            resources: ["configmaps"],
            verbs: ["get", "update", "patch"]
          },
          {
            apiGroups: [""],
            resources: ["configmaps"],
            verbs: ["create"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new Role(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "Role",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager:leaderelection",
          namespace: "kube-system"
        },
        rules: [
          {
            apiGroups: [""],
            resourceNames: ["cert-manager-controller"],
            resources: ["configmaps"],
            verbs: ["get", "update", "patch"]
          },
          {
            apiGroups: [""],
            resources: ["configmaps"],
            verbs: ["create"]
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new RoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "RoleBinding",
        metadata: {
          labels: {
            app: "cainjector",
            "app.kubernetes.io/component": "cainjector",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cainjector"
          },
          name: "cert-manager-cainjector:leaderelection",
          namespace: "kube-system"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "Role",
          name: "cert-manager-cainjector:leaderelection"
        },
        subjects: [
          {
            kind: "ServiceAccount",
            name: "cert-manager-cainjector",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new RoleBinding(
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "RoleBinding",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager:leaderelection",
          namespace: "kube-system"
        },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "Role",
          name: "cert-manager:leaderelection"
        },
        subjects: [
          {
            apiGroup: "",
            kind: "ServiceAccount",
            name: "cert-manager",
            namespace
          }
        ]
      },
      kubeConfig
    )
  );

  collection.add(
    new Service(
      {
        apiVersion: "v1",
        kind: "Service",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager",
          namespace
        },
        spec: {
          ports: [
            {
              port: 9402,
              protocol: "TCP",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              targetPort: 9402 as any
            }
          ],
          selector: {
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          type: "ClusterIP"
        }
      },
      kubeConfig
    )
  );

  collection.add(
    new Deployment(
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
          labels: {
            app: "cainjector",
            "app.kubernetes.io/component": "cainjector",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cainjector"
          },
          name: "cert-manager-cainjector",
          namespace
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {
              "app.kubernetes.io/component": "cainjector",
              "app.kubernetes.io/instance": "cert-manager",
              "app.kubernetes.io/name": "cainjector"
            }
          },
          template: {
            metadata: {
              labels: {
                app: "cainjector",
                "app.kubernetes.io/component": "cainjector",
                "app.kubernetes.io/instance": "cert-manager",
                "app.kubernetes.io/name": "cainjector"
              }
            },
            spec: {
              imagePullSecrets: getImagePullSecrets(),
              containers: [
                {
                  args: ["--v=2", "--leader-elect=false"],
                  env: [
                    {
                      name: "POD_NAMESPACE",
                      valueFrom: {
                        fieldRef: {
                          fieldPath: "metadata.namespace"
                        }
                      }
                    }
                  ],
                  image: DockerImages.certManagerCAInjector,
                  imagePullPolicy: "IfNotPresent",
                  name: "cert-manager",
                  resources: {}
                }
              ],
              serviceAccountName: "cert-manager-cainjector"
            }
          }
        }
      },
      kubeConfig
    )
  );

  collection.add(
    new Deployment(
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
          labels: {
            app: "cert-manager",
            "app.kubernetes.io/component": "controller",
            "app.kubernetes.io/instance": "cert-manager",
            "app.kubernetes.io/name": "cert-manager"
          },
          name: "cert-manager",
          namespace
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {
              "app.kubernetes.io/component": "controller",
              "app.kubernetes.io/instance": "cert-manager",
              "app.kubernetes.io/name": "cert-manager"
            }
          },
          template: {
            metadata: {
              annotations: {
                "prometheus.io/path": "/metrics",
                "prometheus.io/port": "9402",
                "prometheus.io/scrape": "true"
              },
              labels: {
                app: "cert-manager",
                "app.kubernetes.io/component": "controller",
                "app.kubernetes.io/instance": "cert-manager",
                "app.kubernetes.io/name": "cert-manager"
              }
            },
            spec: {
              imagePullSecrets: getImagePullSecrets(),
              containers: [
                {
                  args: [
                    "--v=2",
                    "--cluster-resource-namespace=$(POD_NAMESPACE)",
                    "--leader-election-namespace=kube-system",
                    "--issuer-ambient-credentials=true"
                  ],
                  env: [
                    {
                      name: "POD_NAMESPACE",
                      valueFrom: {
                        fieldRef: {
                          fieldPath: "metadata.namespace"
                        }
                      }
                    }
                  ],
                  image: DockerImages.certManagerController,
                  imagePullPolicy: "IfNotPresent",
                  name: "cert-manager",
                  ports: [
                    {
                      containerPort: 9402,
                      protocol: "TCP"
                    }
                  ],
                  resources: {}
                }
              ],
              serviceAccountName: "cert-manager",
              securityContext: {
                //
                // for cert-manager to be able to read the the service account
                // token with the iam role. otherwise the challenge will fail
                // with:
                //
                // Warning  PresentError  17s (x4 over 42s)  cert-manager
                // Error presenting challenge: error instantiating route53
                // challenge solver: unable to assume role: WebIdentityErr:
                // failed fetching WebIdentity token: caused by: WebIdentityErr:
                // unable to read file at
                // /var/run/secrets/eks.amazonaws.com/serviceaccount/token
                // caused by: open
                // /var/run/secrets/eks.amazonaws.com/serviceaccount/token:
                // permission denied
                //
                // https://github.com/aws/amazon-eks-pod-identity-webhook/issues/8
                //
                fsGroup: 1001,
                runAsUser: 1001
              }
            }
          }
        }
      },
      kubeConfig
    )
  );

  return collection;
}
