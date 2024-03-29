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
    iteration: 1623960497845,
    links: [],
    panels: [
      {
        aliasColors: {},
        bars: false,
        dashLength: 10,
        dashes: false,
        datasource: "metrics",
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
            expr: `sum(sum(ranges{integration_id="${integrationId}",instance=~"$node"})) by (instance)`,
            hide: false,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Ranges",
            refId: "A"
          },
          {
            expr: `sum(sum(replicas_leaders{integration_id="${integrationId}",instance=~"$node"}) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Leaders",
            refId: "B"
          },
          {
            expr: `sum(sum(replicas_leaseholders{integration_id="${integrationId}",instance=~"$node"}) by (instance))`,
            interval: "",
            legendFormat: "Lease Holders",
            refId: "G"
          },
          {
            exemplar: true,
            expr: `sum(sum(replicas_leaders_not_leaseholders{integration_id="${integrationId}",instance=~"$node"}) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Leaders w/o Lease",
            refId: "C"
          },
          {
            expr: `sum(sum(ranges_unavailable{integration_id="${integrationId}",instance=~"$node"}) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Unavailable",
            refId: "D"
          },
          {
            exemplar: true,
            expr: `sum(sum(ranges_underreplicated{integration_id="${integrationId}",instance=~"$node"}) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Under-replicated",
            refId: "E"
          },
          {
            expr: `sum(sum(ranges_overreplicated{integration_id="${integrationId}",instance=~"$node"}) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Over-replicated",
            refId: "F"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Ranges",
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
            $$hashKey: "object:133",
            format: "short",
            label: "ranges",
            logBase: 1,
            max: null,
            min: null,
            show: true
          },
          {
            $$hashKey: "object:134",
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
        description: "The number of replicas on each store.",
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
            expr: `sum(replicas{integration_id="${integrationId}",instance=~"$node"}) by (instance)`,
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
        title: "Replicas per Store",
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
            $$hashKey: "object:431",
            format: "short",
            label: "replicas",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:432",
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
          "The number of leaseholder replicas on each store. A leaseholder replica is the one that receives and coordinates all read and write requests for its range.",
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
            expr: `sum(replicas_leaseholders{integration_id="${integrationId}",instance=~"$node"}) by (instance)`,
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
        title: "Leaseholders per Store",
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
            $$hashKey: "object:581",
            format: "short",
            label: "leaseholders",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:582",
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
          "Exponentially weighted moving average of the number of KV batch requests processed by leaseholder replicas on each store per second. Tracks roughly the last 30 minutes of requests. Used for load-based rebalancing decisions.",
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
            expr: `rebalancing_queriespersecond{integration_id="${integrationId}",instance=~"$node"}`,
            interval: "",
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Average Queries per Store",
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
            $$hashKey: "object:731",
            format: "short",
            label: "queries",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:732",
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
          "Number of logical bytes stored in [key-value pairs](https://www.cockroachlabs.com/docs/v21.1/architecture/distribution-layer.html#table-data) on each node.\n\nThis includes historical and deleted data.",
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
            exemplar: true,
            expr: `totalbytes{integration_id="${integrationId}",instance=~"$node"}`,
            interval: "",
            legendFormat: "{{instance}}",
            refId: "A"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Logical Bytes per Store",
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
            $$hashKey: "object:807",
            format: "bytes",
            label: "logical store size",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:808",
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
        description: "",
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
            expr: `sum(sum(replicas{integration_id="${integrationId}",instance=~"$node"}) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Replicas",
            refId: "A"
          },
          {
            expr: `sum(sum(replicas_quiescent{integration_id="${integrationId}",instance=~"$node"}) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Quiescent",
            refId: "B"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Replica Quiescence",
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
            $$hashKey: "object:883",
            format: "short",
            label: "replicas",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:884",
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
        linewidth: 1,
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
            expr: `sum(sum(rate(range_splits{integration_id="${integrationId}",instance=~"$node"}[5m])) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Splits",
            refId: "A"
          },
          {
            expr: `sum(sum(rate(range_merges{integration_id="${integrationId}",instance=~"$node"}[5m])) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Merges",
            refId: "C"
          },
          {
            expr: `sum(sum(rate(range_adds{integration_id="${integrationId}",instance=~"$node"}[5m])) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Adds",
            refId: "B"
          },
          {
            expr: `sum(sum(rate(range_removes{integration_id="${integrationId}",instance=~"$node"}[5m])) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Removes",
            refId: "D"
          },
          {
            exemplar: true,
            expr: `sum(sum(rate(leases_transfers_success{integration_id="${integrationId}",instance=~"$node"}[5m])) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Lease Transfers",
            refId: "E"
          },
          {
            exemplar: true,
            expr: `sum(sum(rate(rebalancing_lease_transfers{integration_id="${integrationId}",instance=~"$node"}[5m])) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Load-based Lease Transfers",
            refId: "F"
          },
          {
            exemplar: true,
            expr: `sum(sum(rate(rebalancing_range_rebalances{integration_id="${integrationId}",instance=~"$node"}[5m])) by (instance))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Load-based Range Rebalances",
            refId: "G"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Range Operations",
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
            $$hashKey: "object:959",
            format: "short",
            label: "ranges",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:960",
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
            expr: `sum(rate(range_snapshots_generated{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Generated",
            refId: "A"
          },
          {
            exemplar: true,
            expr: `sum(rate(range_snapshots_applied_voter{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Applied (Voters)",
            refId: "B"
          },
          {
            exemplar: true,
            expr: `sum(rate(range_snapshots_applied_initial{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Applied (Initial Upreplication)",
            refId: "C"
          },
          {
            exemplar: true,
            expr: `sum(rate(range_snapshots_applied_initial{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            hide: false,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Applied (Non-Voters)",
            refId: "D"
          },
          {
            expr: `sum(rate(replicas_reserved{integration_id="${integrationId}",instance=~"$node"}[5m]))`,
            interval: "",
            intervalFactor: 2,
            legendFormat: "Reserved Replicas",
            refId: "E"
          }
        ],
        thresholds: [],
        timeFrom: null,
        timeRegions: [],
        timeShift: null,
        title: "Snapshots",
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
            $$hashKey: "object:1109",
            format: "short",
            label: "snapshots",
            logBase: 1,
            max: null,
            min: "0",
            show: true
          },
          {
            $$hashKey: "object:1110",
            format: "short",
            label: "",
            logBase: 1,
            max: null,
            min: "0",
            show: false
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
          sort: 1,
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
    title: "CRDB Console: Replication",
    uid: `rep-${integrationId}`,
    version: 3
  };
}

export type Dashboard = ReturnType<typeof makeDashboard>;
