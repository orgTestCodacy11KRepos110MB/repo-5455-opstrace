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
    annotations: {
      list: [
        {
          builtIn: 1,
          datasource: "-- Grafana --",
          enable: true,
          hide: true,
          iconColor: "rgba(0, 211, 255, 1)",
          name: "Annotations & Alerts",
          type: "dashboard"
        }
      ]
    },
    editable: true,
    gnetId: null,
    graphTooltip: 0,
    iteration: 1623959942178,
    links: [],
    panels: [
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description: "The total number of open SQL Sessions.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 0
        },
        hiddenSeries: false,
        id: 2,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 2,
        nullPointMode: "null as zero",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            expr: `sql_conns{integration_id="${integrationId}",instance=~"$node"}`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "{{instance}}",
            refId: "B"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Open SQL Sessions",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:108",
            format: "short",
            label: "connections",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:109",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description: "The total number of SQL transactions currently open.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 8
        },
        hiddenSeries: false,
        id: 30,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `sql_txns_open{integration_id="${integrationId}",instance=~"$node"}`,
            interval: "",
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Open SQL Transactions",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:279",
            format: "short",
            label: "transactions",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:280",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description: "The total number of SQL statements currently running.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 16
        },
        hiddenSeries: false,
        id: 10,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 2,
        nullPointMode: "null as zero",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `sum(sql_distsql_queries_active{integration_id="${integrationId}",cluster=~"$cluster",instance=~"$node"})`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Active Statements",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Active SQL Statements",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:184",
            format: "short",
            label: "queries",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:185",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The total amount of SQL client network traffic in bytes per second.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 24
        },
        hiddenSeries: false,
        id: 4,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `sum(rate(sql_bytesin{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            instant: false,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Bytes In",
            refId: "A"
          },
          {
            exemplar: true,
            expr: `sum(rate(sql_bytesout{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Bytes Out",
            refId: "B"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "SQL Byte Traffic",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:260",
            format: "bytes",
            label: "byte traffic",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:261",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "A moving average of the # of SELECT, INSERT, UPDATE, and DELETE statements successfully executed per second.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 32
        },
        hiddenSeries: false,
        id: 6,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `sum(rate(sql_select_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Selects",
            refId: "A"
          },
          {
            exemplar: true,
            expr: `sum(rate(sql_update_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Updates",
            refId: "B"
          },
          {
            exemplar: true,
            expr: `sum(rate(sql_insert_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Inserts",
            refId: "C"
          },
          {
            exemplar: true,
            expr: `sum(rate(sql_delete_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Deletes",
            refId: "D"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "SQL Statements",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:336",
            format: "short",
            label: "queries",
            logBase: 1,
            max: null,
            min: null,
            show: true
          },
          {
            $$hashKey: "object:337",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The number of statements which returned a planning or runtime error.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 40
        },
        hiddenSeries: false,
        id: 8,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `sum(rate(sql_failure_count{integration_id="${integrationId}",cluster=~"$cluster",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Errors",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "SQL Statement Errors",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:412",
            format: "short",
            label: "errors",
            logBase: 1,
            max: "1",
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:413",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The total number of SQL statements that experienced contention.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 48
        },
        hiddenSeries: false,
        id: 32,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `sum(rate(sql_distsql_contended_queries_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            legendFormat: "Contention",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "SQL Statement Contention",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:489",
            format: "short",
            label: "queries",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:490",
            format: "short",
            label: "",
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The number of flows on each node contributing to currently running distributed SQL statements.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 56
        },
        hiddenSeries: false,
        id: 12,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `rate(sql_distsql_flows_active{integration_id="${integrationId}",cluster=~"$cluster",instance=~"$node"}[5m])`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Active Flows for Distributed SQL Statements",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:107",
            format: "short",
            label: "flows",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:108",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "Over the last minute, this node executed 99% of queries within this time. This time does not include network latency between the node and client.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 64
        },
        hiddenSeries: false,
        id: 14,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `histogram_quantile(0.99, rate(sql_service_latency_bucket{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Service Latency: SQL, 99th percentile",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:710",
            format: "ns",
            label: "latency",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:711",
            format: "short",
            label: "",
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "Over the last minute, this node executed 90% of queries within this time. This time does not include network latency between the node and client.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 72
        },
        hiddenSeries: false,
        id: 16,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            expr: `histogram_quantile(0.90, rate(sql_service_latency_bucket{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Service Latency: SQL, 90th percentile",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:934",
            format: "ns",
            label: "latency",
            logBase: 1,
            max: null,
            min: null,
            show: true
          },
          {
            $$hashKey: "object:935",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The 99th percentile of latency between query requests and responses over a 1 minute period. Values are displayed individually for each node.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 80
        },
        hiddenSeries: false,
        id: 18,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 2,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            expr: `histogram_quantile(0.99,rate(exec_latency_bucket{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "KV Execution Latency: 99th percentile",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:1084",
            format: "µs",
            label: "latency",
            logBase: 1,
            max: null,
            min: null,
            show: true
          },
          {
            $$hashKey: "object:1085",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The 90th percentile of latency between query requests and responses over a 1 minute period. Values are displayed individually for each node.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 88
        },
        hiddenSeries: false,
        id: 20,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            expr: `histogram_quantile(0.90, rate(exec_latency_bucket{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "KV Execution Latency: 90th percentile",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:1160",
            format: "ns",
            label: "latency",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:1161",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The total number of transactions initiated, committed, rolled back, or aborted per second.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 96
        },
        hiddenSeries: false,
        id: 22,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 2,
        nullPointMode: "null as zero",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            expr: `sum(rate(sql_txn_begin_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Begin",
            refId: "A"
          },
          {
            exemplar: true,
            expr: `sum(rate(sql_txn_commit_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Commits",
            refId: "B"
          },
          {
            exemplar: true,
            expr: `sum(rate( sql_txn_rollback_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Rollbacks",
            refId: "D"
          },
          {
            exemplar: true,
            expr: `sum(rate(sql_txn_abort_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Aborts",
            refId: "C"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Transactions",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:1458",
            format: "short",
            label: "latency",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:1459",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The 99th percentile of total transaction time over a 1 minute period. Values are displayed individually for each node.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 104
        },
        hiddenSeries: false,
        id: 26,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            expr: `histogram_quantile(0.99,rate(sql_txn_latency_bucket{integration_id="${integrationId}"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Transaction Latency: 99th percentile",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:1756",
            format: "µs",
            label: "latency",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:1757",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The 90th percentile of total transaction time over a 1 minute period. Values are displayed individually for each node.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 112
        },
        hiddenSeries: false,
        id: 28,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 2,
        nullPointMode: "null as zero",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `histogram_quantile(0.90,rate(sql_txn_latency_bucket{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Transaction Latency: 90th percentile",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:1832",
            format: "ns",
            label: "latency",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:1833",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The current amount of allocated SQL memory. This amount is what is compared against the node's --max-sql-memory flag.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 120
        },
        hiddenSeries: false,
        id: 34,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `sql_mem_root_current{integration_id="${integrationId}",instance=~"$node"}`,
            interval: "",
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "SQL Memory",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:157",
            format: "bytes",
            label: "allocation bytes",
            logBase: 1,
            max: null,
            min: null,
            show: true
          },
          {
            $$hashKey: "object:158",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description: "The total number of DDL statements per second",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 128
        },
        hiddenSeries: false,
        id: 24,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 2,
        nullPointMode: "null as zero",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `sum(rate(sql_ddl_count{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "DDL Statements",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Schema Changes",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:1908",
            format: "short",
            label: "statements",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:1909",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      },
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
        description:
          "The total number of statements denied per second due to a [cluster setting](https://www.cockroachlabs.com/docs/v21.1/cluster-settings.html) in the format feature.statement_type.enabled = FALSE.",
        fieldConfig: {
          defaults: {},
          overrides: []
        },
        fill: 1,
        fillGradient: 0,
        gridPos: {
          h: 8,
          w: 24,
          x: 0,
          y: 136
        },
        hiddenSeries: false,
        id: 36,
        legend: {
          avg: false,
          current: false,
          max: false,
          min: false,
          show: true,
          total: false,
          values: false
        },
        lines: true,
        linewidth: 1,
        nullPointMode: "null",
        options: {
          alertThreshold: true
        },
        percentage: false,
        pluginVersion: "",
        pointradius: 2,
        points: false,
        renderer: "flot",
        seriesOverrides: [],
        spaceLength: 10,
        stack: false,
        steppedLine: false,
        targets: [
          {
            exemplar: true,
            expr: `rate(sql_feature_flag_denial{integration_id="${integrationId}",instance=~"$node"}[5m])`,
            interval: "",
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeRegions: [],
        title: "Statement Denials: Cluster Settings",
        tooltip: {
          shared: true,
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
            $$hashKey: "object:214",
            format: "short",
            label: "statements",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:215",
            format: "short",
            label: null,
            logBase: 1,
            max: null,
            min: null,
            show: true
          }
        ],
        yaxis: {
          align: false,
          alignLevel: null
        }
      }
    ],
    refresh: false,
    schemaVersion: 27,
    style: "dark",
    tags: [],
    templating: {
      list: [
        {
          allValue: "",
          current: {
            selected: false,
            text: "All",
            value: "$__all"
          },
          datasource: "metrics",
          definition: `label_values(sys_uptime{integration_id="${integrationId}"},instance)`,
          description: null,
          error: null,
          hide: 0,
          includeAll: true,
          label: "Node",
          multi: false,
          name: "node",
          options: [],
          query: {
            query: `label_values(sys_uptime{integration_id="${integrationId}"},instance)`,
            refId: "Prometheus-node-Variable-Query"
          },
          refresh: 1,
          regex: "",
          skipUrlSync: false,
          sort: 3,
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
    timepicker: {},
    timezone: "utc",
    title: "CRDB Console: SQL",
    uid: `sql-${integrationId}`,
    version: 2
  };
}

export type Dashboard = ReturnType<typeof makeDashboard>;
