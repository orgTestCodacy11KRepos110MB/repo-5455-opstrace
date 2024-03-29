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

import {
  ResourceCollection,
  Secret,
  Deployment,
  ConfigMap,
  Service
} from "@opstrace/kubernetes";
import { State } from "../../../reducer";
import { Tenant } from "@opstrace/tenants";
import { getTenantNamespace, getControllerConfig } from "../../../helpers";
import { KubeConfig } from "@kubernetes/client-node";
import { DockerImages, getImagePullSecrets } from "@opstrace/controller-config";

export function GrafanaDatasourceResources(
  state: State,
  kubeConfig: KubeConfig,
  tenant: Tenant
): ResourceCollection {
  const collection = new ResourceCollection();
  const namespace = getTenantNamespace(tenant);

  // Delete datasources and Grafana will recreate them. This ensures we remove all old/unused datasources that we may have previously deployed
  // https://grafana.com/docs/grafana/latest/administration/provisioning/#example-data-source-config-file
  const getDatasourcesToDelete = () => {
    const datasourcesToDelete: { name: string; orgId: number }[] = [];

    if (tenant.name === "system") {
      state.tenants.list.tenants
        .filter(t => t.name !== "system")
        .forEach(t =>
          datasourcesToDelete.push(
            {
              name: `tenant-${t.name}-metrics`,
              orgId: 1
            },
            {
              name: `tenant-${t.name}-logs`,
              orgId: 1
            }
          )
        );
    }
    return datasourcesToDelete;
  };

  // Check https://github.com/opstrace/opstrace/issues/896 for more details.
  // Using a variable in proxy_pass forces re-resolution of the DNS names
  // because NGINX treats variables differently to static configuration. From
  // the NGINX proxy_pass documentation
  // http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass. For
  // this to work we need to also set a resolver but EKS and GKE use different
  // ClusterIPs for the pod DNS upstream resolver.
  let dnsResolver = "";
  const { target } = getControllerConfig(state);

  if (target === "aws") {
    dnsResolver = "10.100.0.10";
  }

  if (target === "gcp") {
    // This IP address depends on the GKE cluster, see
    // https://cloud.google.com/kubernetes-engine/docs/concepts/service-discovery
    // We could parse /etc/resolv.conf but it seems like
    // a _dynamic_ resolver should also work:
    // kube-dns.kube-system.svc.cluster.local valid=5s;
    // Refs:
    //   https://www.nginx.com/blog/announcing-nginx-ingress-controller-for-kubernetes-release-1-4-0/
    //   https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/
    // Does/should this work for AWS, too?
    dnsResolver = "kube-dns.kube-system.svc.cluster.local valid=5s";
  }

  // Warning: the order in the `datasources` array defines the IDs assigned to
  // individual data sources -- these IDs are being used in certain tests,
  // and changing the order might break them. Also see
  // https://github.com/opstrace/opstrace/pull/914
  const datasources = {
    apiVersion: 1,
    deleteDatasources: getDatasourcesToDelete(),
    datasources: [
      {
        access: "proxy",
        editable: false,
        name: "metrics",
        orgId: 1,
        type: "prometheus",
        url: `http://grafana-datasource-splitter-cortex.${namespace}.svc.cluster.local`,
        version: 2
      },
      {
        name: "logs",
        editable: false,
        type: "loki",
        orgId: 1,
        url: `http://grafana-datasource-splitter-loki.${namespace}.svc.cluster.local`,
        access: "proxy",
        version: 2
      },
      {
        name: "alertmanager",
        editable: false,
        type: "alertmanager",
        isDefault: true,
        orgId: 1,
        url: `http://alertmanager.cortex.svc.cluster.local`,
        access: "proxy",
        version: 1,
        jsonData: {
          httpHeaderName1: "HeaderName",
          httpHeaderName2: "X-Scope-OrgID"
        },
        secureJsonData: {
          httpHeaderValue1: "HeaderValue",
          httpHeaderValue2: `${tenant.name}`
        }
      }
    ]
  };

  /**
   * Grafana will filter all datasources of type "prometheus" and "loki" and it will use those for:
   * 1) retrieving metrics/logs/labels/etc
   * 2) attempt to retrieve alerts and rules by adding the paths /api/v1/alerts and /api/v1/rules to the datasource.
   *
   * This is problematic because we want (1) to query the querier and we want (2) to query the rulers.
   *
   * The absence of the /api/v1/rules|alerts routes on the queriers results in an Error when browsing the Alerting tab in Grafana
   * because the requests return 404s.
   *
   * The following reverse proxy is required to split the datasource route for Cortex/Loki, so that alerts/rules requests will be routed
   * to the ruler services and all other requests will be routed to the queriers.
   */

  const generalProxyConfig = `set $pass_access_scheme  $scheme;
      set $pass_server_port    $server_port;
      set $best_http_host      $http_host;
      set $pass_port           $pass_server_port;

      client_max_body_size                    10m;
      proxy_set_header Host                   $best_http_host;

      # Allow websocket connections
      proxy_set_header                        Upgrade           $http_upgrade;
      proxy_set_header                        Connection        $connection_upgrade;

      proxy_set_header X-Request-ID           $req_id;
      proxy_set_header X-Real-IP              $remote_addr;
      proxy_set_header X-Forwarded-For        $remote_addr;
      proxy_set_header X-Forwarded-Host       $best_http_host;
      proxy_set_header X-Forwarded-Port       $pass_port;
      proxy_set_header X-Forwarded-Proto      $pass_access_scheme;
      proxy_set_header X-Scheme               $pass_access_scheme;

      # Pass the original X-Forwarded-For
      proxy_set_header X-Original-Forwarded-For $http_x_forwarded_for;

      # mitigate HTTPoxy Vulnerability
      # https://www.nginx.com/blog/mitigating-the-httpoxy-vulnerability-with-nginx/
      proxy_set_header Proxy                  "";

      # Custom headers to proxied server
      proxy_connect_timeout                   5s;
      proxy_send_timeout                      60s;
      proxy_read_timeout                      60s;

      proxy_buffering                         off;

      proxy_request_buffering                 on;
      proxy_http_version                      1.1;

      proxy_cookie_domain                     off;
      proxy_cookie_path                       off;

      # In case of errors try the next upstream server before returning an error
      proxy_next_upstream                     error timeout;
      proxy_next_upstream_timeout             0;
      proxy_next_upstream_tries               3;

      proxy_redirect                          off;

      # Set the tenant header for Cortex/Loki
      proxy_set_header X-Scope-OrgID          ${tenant.name};
`;

  function getNginxConfig(locations: string) {
    return `
worker_processes  1;
events {}
http {
  client_header_buffer_size       1k;
  client_header_timeout           60s;
  client_body_buffer_size         10m;
  client_body_timeout             60s;

  large_client_header_buffers     4 8k;
  keepalive_requests              1000;
  http2_max_concurrent_streams    128;

  underscores_in_headers          off;
  ignore_invalid_headers          on;

  limit_req_status                503;
  limit_conn_status               503;

  error_log  /var/log/nginx/error.log error;

  server {
    server_name _ ;
    listen 80 default_server;
    listen [::]:80 default_server;
    set $proxy_upstream_name "-";

    ${locations}

  }

  # Obtain best http host
  map $http_host $this_host {
    default          $http_host;
    ''               $host;
  }

  map $http_x_forwarded_host $best_http_host {
    default          $http_x_forwarded_host;
    ''               $this_host;
  }

  map $http_upgrade $connection_upgrade {
    default upgrade;
   '' close;
  }

  # Reverse proxies can detect if a client provides a X-Request-ID header, and pass it on to the backend server.
  # If no such header is provided, it can provide a random value.
  map $http_x_request_id $req_id {
    default   $http_x_request_id;
    ""        $request_id;
  }
}

`;
  }

  collection.add(
    new ConfigMap(
      {
        apiVersion: "v1",
        data: {
          "nginx.conf": getNginxConfig(
            `

            # Pass most requests on to the querier
            location / {
              ${generalProxyConfig}

              resolver ${dnsResolver};
              set $backend http://query-frontend.loki.svc.cluster.local:1080;
              proxy_pass $backend;
            }

            # For specific routes, pass on to the ruler
            location /prometheus/api/v1/rules {
              ${generalProxyConfig}
              resolver ${dnsResolver};
              # Do not change the request URL
              set $backend http://ruler.loki.svc.cluster.local:1080;
              proxy_pass $backend;
            }

            location /prometheus/api/v1/alerts {
              ${generalProxyConfig}
              resolver ${dnsResolver};
              # Do not change the request URL
              set $backend http://ruler.loki.svc.cluster.local:1080;
              proxy_pass $backend;
            }

            location /loki/api/v1/rules {
              ${generalProxyConfig}
              resolver ${dnsResolver};
              # Do not change the request URL, this works for the following endpoints:
              # /loki/api/v1/rules
              # /loki/api/v1/rules/{namespace}
              set $backend http://ruler.loki.svc.cluster.local:1080;
              proxy_pass $backend;
            }

            # Loki legacy route for saving rules (legacy routes which the Grafana 8 alerting feature uses)
            location ~ ^/api/prom/rules(?<urlsuffix>.*)$ {
              ${generalProxyConfig}
              resolver ${dnsResolver};
              set $backend http://ruler.loki.svc.cluster.local:1080/loki/api/v1/rules$urlsuffix;
              proxy_pass $backend;
            }
            `
          )
        },
        kind: "ConfigMap",
        metadata: {
          name: "grafana-datasource-splitter-loki",
          namespace
        }
      },
      kubeConfig
    )
  );

  collection.add(
    new ConfigMap(
      {
        apiVersion: "v1",
        data: {
          "nginx.conf": getNginxConfig(
            `
          location / {
            ${generalProxyConfig}
            resolver ${dnsResolver};
            set $backend "http://query-frontend.cortex.svc.cluster.local:80";
            proxy_pass $backend;
          }

          location ~ ^/api/v1/rules(?<urlsuffix>.*)$ {
            ${generalProxyConfig}
            resolver ${dnsResolver};
            set $backend "http://ruler.cortex.svc.cluster.local/prometheus/api/v1/rules$urlsuffix";
            proxy_pass $backend;
          }

          location ~ ^/api/v1/alerts(?<urlsuffix>.*)$ {
            ${generalProxyConfig}
            resolver ${dnsResolver};
            set $backend "http://ruler.cortex.svc.cluster.local/prometheus/api/v1/alerts$urlsuffix";
            proxy_pass $backend;
          }

          # Cortex specific ruler routes (legacy routes which the Grafana 8 alerting feature uses)
          location ~ ^/rules(?<urlsuffix>.*)$ {
            ${generalProxyConfig}
            resolver ${dnsResolver};
            set $backend http://ruler.cortex.svc.cluster.local/api/v1/rules$urlsuffix;
            proxy_pass $backend;
          }
          `
          )
        },
        kind: "ConfigMap",
        metadata: {
          name: "grafana-datasource-splitter-cortex",
          namespace
        }
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
          name: "grafana-datasource-splitter-loki",
          namespace
        },
        spec: {
          ports: [
            {
              name: "http",
              port: 80,
              protocol: "TCP",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              targetPort: 80 as any
            }
          ],
          selector: {
            app: "grafana-datasource-splitter-loki"
          }
        }
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
          name: "grafana-datasource-splitter-cortex",
          namespace
        },
        spec: {
          ports: [
            {
              name: "http",
              port: 80,
              protocol: "TCP",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              targetPort: 80 as any
            }
          ],
          selector: {
            app: "grafana-datasource-splitter-cortex"
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
            app: "grafana-datasource-splitter-loki"
          },
          name: "grafana-datasource-splitter-loki",
          namespace
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {
              app: "grafana-datasource-splitter-loki"
            }
          },

          template: {
            metadata: {
              labels: {
                app: "grafana-datasource-splitter-loki"
              }
            },
            spec: {
              imagePullSecrets: getImagePullSecrets(),
              containers: [
                {
                  image: DockerImages.nginx,
                  name: "grafana-datasource-splitter-loki",
                  imagePullPolicy: "IfNotPresent",
                  ports: [
                    {
                      containerPort: 80,
                      name: "http"
                    }
                  ],
                  resources: {},
                  volumeMounts: [
                    {
                      mountPath: "/etc/nginx/",
                      name: "conf"
                    }
                  ]
                }
              ],
              volumes: [
                {
                  name: "conf",
                  configMap: {
                    name: "grafana-datasource-splitter-loki"
                  }
                }
              ]
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
            app: "grafana-datasource-splitter-cortex"
          },
          name: "grafana-datasource-splitter-cortex",
          namespace
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {
              app: "grafana-datasource-splitter-cortex"
            }
          },
          template: {
            metadata: {
              labels: {
                app: "grafana-datasource-splitter-cortex"
              }
            },
            spec: {
              imagePullSecrets: getImagePullSecrets(),
              containers: [
                {
                  image: DockerImages.nginx,
                  name: "grafana-datasource-splitter-cortex",
                  imagePullPolicy: "IfNotPresent",
                  ports: [
                    {
                      containerPort: 80,
                      name: "http"
                    }
                  ],
                  resources: {},
                  volumeMounts: [
                    {
                      mountPath: "/etc/nginx/",
                      name: "conf"
                    }
                  ]
                }
              ],
              volumes: [
                {
                  name: "conf",
                  configMap: {
                    name: "grafana-datasource-splitter-cortex"
                  }
                }
              ]
            }
          }
        }
      },
      kubeConfig
    )
  );

  collection.add(
    new Secret(
      {
        apiVersion: "v1",
        data: {
          "datasources.yaml": Buffer.from(JSON.stringify(datasources)).toString(
            "base64"
          )
        },
        kind: "Secret",
        metadata: {
          name: "grafana-datasources",
          namespace
        },
        type: "Opaque"
      },
      kubeConfig
    )
  );

  return collection;
}
