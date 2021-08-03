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

export default function makeDashboard(integrationId: string) {
  return {
    __inputs: [],
    __requires: [],
    annotations: {
      list: []
    },
    editable: false,
    gnetId: null,
    graphTooltip: 1,
    hideControls: false,
    id: null,
    links: [],
    refresh: "",
    rows: [
      {
        collapse: false,
        collapsed: false,
        panels: [
          {
            cacheTimeout: null,
            colorBackground: false,
            colorValue: false,
            colors: ["#299c46", "rgba(237, 129, 40, 0.89)", "#d44a3a"],
            datasource: "$datasource",
            format: "none",
            gauge: {
              maxValue: 100,
              minValue: 0,
              show: false,
              thresholdLabels: false,
              thresholdMarkers: true
            },
            gridPos: {},
            id: 2,
            interval: null,
            links: [],
            mappingType: 1,
            mappingTypes: [
              {
                name: "value to text",
                value: 1
              },
              {
                name: "range to text",
                value: 2
              }
            ],
            maxDataPoints: 100,
            nullPointMode: "connected",
            nullText: null,
            postfix: "",
            postfixFontSize: "50%",
            prefix: "",
            prefixFontSize: "50%",
            rangeMaps: [
              {
                from: "null",
                text: "N/A",
                to: "null"
              }
            ],
            span: 2,
            sparkline: {
              fillColor: "rgba(31, 118, 189, 0.18)",
              full: false,
              lineColor: "rgb(31, 120, 193)",
              show: false
            },
            tableColumn: "",
            targets: [
              {
                expr: `sum(up{integration_id="${integrationId}",job="apiserver"})`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "",
                refId: "A"
              }
            ],
            thresholds: "",
            title: "Up",
            tooltip: {
              shared: false
            },
            type: "singlestat",
            valueFontSize: "80%",
            valueMaps: [
              {
                op: "=",
                text: "N/A",
                value: "null"
              }
            ],
            valueName: "min"
          },
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 3,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: true,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 5,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(apiserver_request_total{integration_id="${integrationId}",job="apiserver", instance=~"$instance",code=~"2.."}[5m]))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "2xx",
                refId: "A"
              },
              {
                expr: `sum(rate(apiserver_request_total{integration_id="${integrationId}",job="apiserver", instance=~"$instance",code=~"3.."}[5m]))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "3xx",
                refId: "B"
              },
              {
                expr: `sum(rate(apiserver_request_total{integration_id="${integrationId}",job="apiserver", instance=~"$instance",code=~"4.."}[5m]))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "4xx",
                refId: "C"
              },
              {
                expr: `sum(rate(apiserver_request_total{integration_id="${integrationId}",job="apiserver", instance=~"$instance",code=~"5.."}[5m]))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "5xx",
                refId: "D"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "RPC Rate",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "ops",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              },
              {
                format: "ops",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              }
            ]
          },
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 4,
            legend: {
              alignAsTable: "true",
              avg: false,
              current: "true",
              max: false,
              min: false,
              rightSide: "true",
              show: "true",
              total: false,
              values: "true"
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 5,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `histogram_quantile(0.99, sum(rate(apiserver_request_duration_seconds_bucket{integration_id="${integrationId}",job="apiserver", instance=~"$instance"}[5m])) by (verb, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{verb}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Request duration 99th quantile",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "s",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              },
              {
                format: "s",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              }
            ]
          }
        ],
        repeat: null,
        repeatIteration: null,
        repeatRowId: null,
        showTitle: false,
        title: "Dashboard Row",
        titleSize: "h6",
        type: "row"
      },
      {
        collapse: false,
        collapsed: false,
        panels: [
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 5,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: false,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(workqueue_adds_total{integration_id="${integrationId}",job="apiserver", instance=~"$instance"}[5m])) by (instance, name)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} {{name}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Work Queue Add Rate",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "ops",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              },
              {
                format: "ops",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              }
            ]
          },
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 6,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: false,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(workqueue_depth{integration_id="${integrationId}",job="apiserver", instance=~"$instance"}[5m])) by (instance, name)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} {{name}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Work Queue Depth",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "short",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              },
              {
                format: "short",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              }
            ]
          },
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 7,
            legend: {
              alignAsTable: "true",
              avg: false,
              current: "true",
              max: false,
              min: false,
              rightSide: "true",
              show: "true",
              total: false,
              values: "true"
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 12,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `histogram_quantile(0.99, sum(rate(workqueue_queue_duration_seconds_bucket{integration_id="${integrationId}",job="apiserver", instance=~"$instance"}[5m])) by (instance, name, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} {{name}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Work Queue Latency",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "s",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              },
              {
                format: "s",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              }
            ]
          }
        ],
        repeat: null,
        repeatIteration: null,
        repeatRowId: null,
        showTitle: false,
        title: "Dashboard Row",
        titleSize: "h6",
        type: "row"
      },
      {
        collapse: false,
        collapsed: false,
        panels: [
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 8,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: true,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 4,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `etcd_helper_cache_entry_total{integration_id="${integrationId}",job="apiserver", instance=~"$instance"}`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "ETCD Cache Entry Total",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "short",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              },
              {
                format: "short",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              }
            ]
          },
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 9,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: true,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 4,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(etcd_helper_cache_hit_total{integration_id="${integrationId}",job="apiserver",instance=~"$instance"}[5m])) by (intance)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} hit",
                refId: "A"
              },
              {
                expr: `sum(rate(etcd_helper_cache_miss_total{integration_id="${integrationId}",job="apiserver",instance=~"$instance"}[5m])) by (instance)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} miss",
                refId: "B"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "ETCD Cache Hit/Miss Rate",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "ops",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              },
              {
                format: "ops",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              }
            ]
          },
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 10,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: true,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 4,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `histogram_quantile(0.99,sum(rate(etcd_request_cache_get_duration_seconds_bucket{integration_id="${integrationId}",job="apiserver",instance=~"$instance"}[5m])) by (instance, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} get",
                refId: "A"
              },
              {
                expr: `histogram_quantile(0.99,sum(rate(etcd_request_cache_add_duration_seconds_bucket{integration_id="${integrationId}",job="apiserver",instance=~"$instance"}[5m])) by (instance, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} miss",
                refId: "B"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "ETCD Cache Duration 99th Quantile",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "s",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              },
              {
                format: "s",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              }
            ]
          }
        ],
        repeat: null,
        repeatIteration: null,
        repeatRowId: null,
        showTitle: false,
        title: "Dashboard Row",
        titleSize: "h6",
        type: "row"
      },
      {
        collapse: false,
        collapsed: false,
        panels: [
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 11,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: true,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 4,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `process_resident_memory_bytes{integration_id="${integrationId}",job="apiserver",instance=~"$instance"}`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Memory",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "bytes",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              },
              {
                format: "bytes",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              }
            ]
          },
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 12,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: true,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 4,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `rate(process_cpu_seconds_total{integration_id="${integrationId}",job="apiserver",instance=~"$instance"}[5m])`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "CPU usage",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "short",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              },
              {
                format: "short",
                label: null,
                logBase: 1,
                max: null,
                min: 0,
                show: true
              }
            ]
          },
          {
            aliasColors: {},
            bars: false,
            dashLength: 10,
            dashes: false,
            datasource: "$datasource",
            fill: 1,
            gridPos: {},
            id: 13,
            legend: {
              alignAsTable: false,
              avg: false,
              current: false,
              max: false,
              min: false,
              rightSide: false,
              show: true,
              total: false,
              values: false
            },
            lines: true,
            linewidth: 1,
            links: [],
            nullPointMode: "null",
            percentage: false,
            pointradius: 5,
            points: false,
            renderer: "flot",
            repeat: null,
            seriesOverrides: [],
            spaceLength: 10,
            span: 4,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `go_goroutines{integration_id="${integrationId}",job="apiserver",instance=~"$instance"}`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Goroutines",
            tooltip: {
              shared: false,
              sort: 0,
              value_type: "individual"
            },
            type: "graph",
            xaxis: {
              buckets: null,
              mode: "time",
              name: null,
              show: true,
              values: []
            },
            yaxes: [
              {
                format: "short",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              },
              {
                format: "short",
                label: null,
                logBase: 1,
                max: null,
                min: null,
                show: true
              }
            ]
          }
        ],
        repeat: null,
        repeatIteration: null,
        repeatRowId: null,
        showTitle: false,
        title: "Dashboard Row",
        titleSize: "h6",
        type: "row"
      }
    ],
    schemaVersion: 14,
    style: "dark",
    tags: ["kubernetes-integration"],
    templating: {
      list: [
        {
          current: {
            text: "Prometheus",
            value: "Prometheus"
          },
          hide: 0,
          label: null,
          name: "datasource",
          options: [],
          query: "prometheus",
          refresh: 1,
          regex: "",
          type: "datasource"
        },
        {
          allValue: null,
          current: {},
          datasource: "$datasource",
          hide: 0,
          includeAll: true,
          label: null,
          multi: false,
          name: "instance",
          options: [],
          query: `label_values(apiserver_request_total{job="apiserver"}, instance)`,
          refresh: 2,
          regex: "",
          sort: 0,
          tagValuesQuery: "",
          tags: [],
          tagsQuery: "",
          type: "query",
          useTags: false
        }
      ]
    },
    time: {
      from: "now-1h",
      to: "now"
    },
    timepicker: {
      refresh_intervals: [
        "5s",
        "10s",
        "30s",
        "1m",
        "5m",
        "15m",
        "30m",
        "1h",
        "2h",
        "1d"
      ],
      time_options: ["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"]
    },
    timezone: "",
    title: "Kubernetes / API server metrics",
    uid: "09ec8aa1e996d6ffcd6817bbaff4db1b",
    version: 0
  };
}

export type Dashboard = ReturnType<typeof makeDashboard>;
