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
                expr: `sum(up{integration_id="${integrationId}",job="kubelet"})`,
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
            id: 3,
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
                expr: `sum(kubelet_running_pod_count{integration_id="${integrationId}",job="kubelet", instance=~"$instance"})`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: "",
            title: "Running Pods",
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
            id: 4,
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
                expr: `sum(kubelet_running_container_count{integration_id="${integrationId}",job="kubelet", instance=~"$instance"})`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: "",
            title: "Running Container",
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
            id: 5,
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
                expr: `sum(volume_manager_total_volumes{integration_id="${integrationId}",job="kubelet", instance=~"$instance", state="actual_state_of_world"})`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: "",
            title: "Actual Volume Count",
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
            id: 6,
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
                expr: `sum(volume_manager_total_volumes{integration_id="${integrationId}",job="kubelet", instance=~"$instance",state="desired_state_of_world"})`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: "",
            title: "Desired Volume Count",
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
            id: 7,
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
                expr: `sum(rate(kubelet_node_config_error{integration_id="${integrationId}",job="kubelet", instance=~"$instance"}[5m]))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: "",
            title: "Config Error Count",
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(kubelet_runtime_operations_total{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (operation_type, instance)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} {{operation_type}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Operation Rate",
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
            id: 9,
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(kubelet_runtime_operations_errors_total{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance, operation_type)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} {{operation_type}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Operation Error Rate",
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
            id: 10,
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
                expr: `histogram_quantile(0.99, sum(rate(kubelet_runtime_operations_duration_seconds_bucket{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance, operation_type, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} {{operation_type}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Operation duration 99th quantile",
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
            id: 11,
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(kubelet_pod_start_duration_seconds_count{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} pod",
                refId: "A"
              },
              {
                expr: `sum(rate(kubelet_pod_worker_duration_seconds_count{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} worker",
                refId: "B"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Pod Start Rate",
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
            id: 12,
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `histogram_quantile(0.99, sum(rate(kubelet_pod_start_duration_seconds_count{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} pod",
                refId: "A"
              },
              {
                expr: `histogram_quantile(0.99, sum(rate(kubelet_pod_worker_duration_seconds_bucket{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} worker",
                refId: "B"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Pod Start Duration",
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
            id: 13,
            legend: {
              alignAsTable: "true",
              avg: false,
              current: "true",
              hideEmpty: "true",
              hideZero: "true",
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(storage_operation_duration_seconds_count{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance, operation_name, volume_plugin)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat:
                  "{{instance}} {{operation_name}} {{volume_plugin}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Storage Operation Rate",
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
            id: 14,
            legend: {
              alignAsTable: "true",
              avg: false,
              current: "true",
              hideEmpty: "true",
              hideZero: "true",
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(storage_operation_errors_total{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance, operation_name, volume_plugin)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat:
                  "{{instance}} {{operation_name}} {{volume_plugin}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Storage Operation Error Rate",
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
            id: 15,
            legend: {
              alignAsTable: "true",
              avg: false,
              current: "true",
              hideEmpty: "true",
              hideZero: "true",
              max: false,
              min: false,
              rightSide: "true",
              show: true,
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
                expr: `histogram_quantile(0.99, sum(rate(storage_operation_duration_seconds_bucket{integration_id="${integrationId}",job="kubelet", instance=~"$instance"}[5m])) by (instance, operation_name, volume_plugin, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat:
                  "{{instance}} {{operation_name}} {{volume_plugin}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Storage Operation Duration 99th quantile",
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
            id: 16,
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(kubelet_cgroup_manager_duration_seconds_count{integration_id="${integrationId}",job="kubelet", instance=~"$instance"}[5m])) by (instance, operation_type)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{operation_type}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Cgroup manager operation rate",
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
            id: 17,
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `histogram_quantile(0.99, sum(rate(kubelet_cgroup_manager_duration_seconds_bucket{integration_id="${integrationId}",job="kubelet", instance=~"$instance"}[5m])) by (instance, operation_type, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} {{operation_type}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "Cgroup manager 99th quantile",
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
            description: "Pod lifecycle event generator",
            fill: 1,
            gridPos: {},
            id: 18,
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(kubelet_pleg_relist_duration_seconds_count{integration_id="${integrationId}",job="kubelet", instance=~"$instance"}[5m])) by (instance)`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "PLEG relist rate",
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
            id: 19,
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
            span: 6,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `histogram_quantile(0.99, sum(rate(kubelet_pleg_relist_interval_seconds_bucket{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "PLEG relist interval",
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
            id: 20,
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
                expr: `histogram_quantile(0.99, sum(rate(kubelet_pleg_relist_duration_seconds_bucket{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])) by (instance, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}}",
                refId: "A"
              }
            ],
            thresholds: [],
            timeFrom: null,
            timeShift: null,
            title: "PLEG relist duration",
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
            id: 21,
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
            span: 12,
            stack: false,
            steppedLine: false,
            targets: [
              {
                expr: `sum(rate(rest_client_requests_total{integration_id="${integrationId}",job="kubelet", instance=~"$instance",code=~"2.."}[5m]))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "2xx",
                refId: "A"
              },
              {
                expr: `sum(rate(rest_client_requests_total{integration_id="${integrationId}",job="kubelet", instance=~"$instance",code=~"3.."}[5m]))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "3xx",
                refId: "B"
              },
              {
                expr: `sum(rate(rest_client_requests_total{integration_id="${integrationId}",job="kubelet", instance=~"$instance",code=~"4.."}[5m]))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "4xx",
                refId: "C"
              },
              {
                expr: `sum(rate(rest_client_requests_total{integration_id="${integrationId}",job="kubelet", instance=~"$instance",code=~"5.."}[5m]))`,
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
            id: 22,
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
                expr: `histogram_quantile(0.99, sum(rate(rest_client_request_duration_seconds_bucket{integration_id="${integrationId}",job="kubelet", instance=~"$instance"}[5m])) by (instance, verb, url, le))`,
                format: "time_series",
                intervalFactor: 2,
                legendFormat: "{{instance}} {{verb}} {{url}}",
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
            id: 23,
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
                expr: `process_resident_memory_bytes{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}`,
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
            id: 24,
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
                expr: `rate(process_cpu_seconds_total{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}[5m])`,
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
            id: 25,
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
                expr: `go_goroutines{integration_id="${integrationId}",job="kubelet",instance=~"$instance"}`,
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
          query: `label_values(kubelet_runtime_operations_total{job="kubelet"}, instance)`,
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
    title: "Kubernetes / Kubelet metrics",
    uid: `kub-${integrationId}`,
    version: 0
  };
}

export type Dashboard = ReturnType<typeof makeDashboard>;
