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

import { Ingress, ResourceCollection } from "@opstrace/kubernetes";
import { KubeConfig } from "@kubernetes/client-node";
import { State } from "../../reducer";
import { Tenant } from "@opstrace/tenants";
import { getApiDomain } from "../../helpers";

export const addApiIngress = ({
  serviceName,
  namespace,
  tenant,
  api,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issuer,
  kubeConfig,
  state,
  collection
}: {
  serviceName: string;
  namespace: string;
  tenant: Tenant;
  api: string;
  issuer: string;
  kubeConfig: KubeConfig;
  state: State;
  collection: ResourceCollection;
}): void => {
  const apiHost = getApiDomain(api, tenant, state);

  // Add ingress for data API
  // https-cert is shared with the App UI Ingress on the same domain
  collection.add(
    new Ingress(
      {
        apiVersion: "networking.k8s.io/v1beta1",
        kind: "Ingress",
        metadata: {
          name: `${api}`,
          namespace,
          annotations: {
            "kubernetes.io/ingress.class": "api",
            "external-dns.alpha.kubernetes.io/ttl": "30",
            "nginx.ingress.kubernetes.io/client-body-buffer-size": "10m"
          }
        },
        spec: {
          tls: [
            {
              hosts: [apiHost],
              secretName: "https-cert"
            }
          ],
          rules: [
            {
              host: apiHost,
              http: {
                paths: [
                  {
                    backend: {
                      serviceName,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      servicePort: 8080 as any
                    },
                    pathType: "ImplementationSpecific",
                    path: "/"
                  }
                ]
              }
            }
          ]
        }
      },
      kubeConfig
    )
  );
};

export const addTracingApiIngress = ({
  serviceName,
  namespace,
  tenant,
  api,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  issuer,
  kubeConfig,
  state,
  collection
}: {
  serviceName: string;
  namespace: string;
  tenant: Tenant;
  api: string;
  issuer: string;
  kubeConfig: KubeConfig;
  state: State;
  collection: ResourceCollection;
}): void => {
  const apiHost = getApiDomain(api, tenant, state);

  // Tracing has some differences vs the regular API ingress:
  // - Separate ingress object: custom annotation to support gRPC
  // - Separate ingress class/controller: custom https port 4317 instead of 443
  collection.add(
    new Ingress(
      {
        apiVersion: "networking.k8s.io/v1beta1",
        kind: "Ingress",
        metadata: {
          name: api,
          namespace,
          annotations: {
            // Use the 'tracing' ingress controller which listens at port 4317
            // See also nginxIngress.ts.
            "kubernetes.io/ingress.class": "tracing",
            "external-dns.alpha.kubernetes.io/ttl": "30",
            // CUSTOM ANNOTATION for gRPC support,
            // see also https://kubernetes.github.io/ingress-nginx/examples/grpc/
            "nginx.ingress.kubernetes.io/backend-protocol": "GRPC",
            "nginx.ingress.kubernetes.io/client-body-buffer-size": "10m"
          }
        },
        spec: {
          tls: [
            {
              hosts: [apiHost],
              secretName: "https-cert"
            }
          ],
          rules: [
            {
              host: apiHost,
              http: {
                paths: [
                  {
                    backend: {
                      serviceName,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      servicePort: "otlp-grpc" as any
                    },
                    pathType: "ImplementationSpecific",
                    path: "/"
                  }
                ]
              }
            }
          ]
        }
      },
      kubeConfig
    )
  );
};
