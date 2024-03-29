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

import React from "react";

import { useSelectedTenantWithFallback } from "state/tenant/hooks/useTenant";
import { grafanaUrl } from "client/utils/grafana";

import { cmdID, useCommandService } from "client/services/Command";
import { openTenantPickerCommandId } from "client/views/tenants/TenantPicker";
import { getKeysFromKeybinding } from "client/services/Command/util";

import Grid from "@material-ui/core/Grid";
import { Box } from "client/components/Box";
import { Card, CardContent, CardHeader } from "client/components/Card";
import Typography from "client/components/Typography/Typography";
import { Button } from "client/components/Button";
import { ExternalLink, Link } from "client/components/Link";

const GettingStarted = () => {
  const tenant = useSelectedTenantWithFallback();
  const cmdService = useCommandService();

  let content = (
    <>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            titleTypographyProps={{ variant: "h6" }}
            title="Sending logs from an existing system"
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" variant="body2">
                  Use this endpoint URL for sending logs to the{" "}
                  <strong>{tenant.name}</strong> tenant.
                  <small>
                    <pre>
                      https://loki.{tenant.name}.{window.location.host}
                      /loki/api/v1/push
                    </pre>
                  </small>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="flex-end">
                  <ExternalLink
                    target="_blank"
                    href="https://opstrace.com/docs/guides/user/sending-logs-with-fluentd"
                  >
                    Guide: Sending logs with FluentD →
                  </ExternalLink>
                </Box>
                <Box display="flex" justifyContent="flex-end">
                  <ExternalLink
                    target="_blank"
                    href="https://opstrace.com/docs/guides/user/sending-logs-with-promtail"
                  >
                    Guide: Sending logs with Promtail →
                  </ExternalLink>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            titleTypographyProps={{ variant: "h6" }}
            title="Sending metrics from an existing system"
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" variant="body2">
                  Use this endpoint URL for sending metrics to the{" "}
                  <strong>{tenant.name}</strong> tenant.
                  <small>
                    <pre>
                      https://cortex.{tenant.name}.{window.location.host}
                      /api/v1/push
                    </pre>
                  </small>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="flex-end">
                  <ExternalLink
                    target="_blank"
                    href="https://opstrace.com/docs/guides/user/sending-metrics-with-prometheus"
                  >
                    Guide: Sending metrics with Prometheus →
                  </ExternalLink>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            titleTypographyProps={{ variant: "h6" }}
            title="Collect Logs from a Kubernetes cluster"
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" variant="body2">
                  Get all the configured yaml required to send logs to the{" "}
                  <strong>{tenant.name}</strong> tenant.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="flex-end">
                  <Link to={`/tenant/${tenant.name}/integrations/all`}>
                    Create the Kubernetes Logs Integration →
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            titleTypographyProps={{ variant: "h6" }}
            title="Collect Metrics from a Kubernetes cluster"
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" variant="body2">
                  Get all the configured yaml required to send Metrics to the{" "}
                  <strong>{tenant.name}</strong> tenant.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="flex-end">
                  <Link to={`/tenant/${tenant.name}/integrations/all`}>
                    Create the Kubernetes Metrics Integration →
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            titleTypographyProps={{ variant: "h6" }}
            title="Visit the Grafana Web UI"
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" variant="body2">
                  Visit the Grafana web UI for the{" "}
                  <strong>{tenant.name}</strong> tenant.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="flex-end">
                  <ExternalLink
                    href={grafanaUrl({
                      tenant: tenant.name
                    })}
                  >
                    View Grafana →
                  </ExternalLink>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </>
  );

  if (tenant?.name === "system") {
    content = (
      <>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: "h6" }}
              title="Visit the Command Palette"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={9}>
                  <Typography color="textSecondary" variant="body2">
                    You can navigate your way through the UI using the Command
                    Palette. Additional contextual commands will be available
                    depending on the page and element in focus.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => cmdService.executeCommand(cmdID)}
                    >
                      {getKeysFromKeybinding("mod+k").join(" ")}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: "h6" }}
              title="What is the System Tenant"
            />
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                This tenant contains all the system logs, metrics, dashboards
                and alerts for this Opstrace cluster.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: "h6" }}
              title="Select a Tenant"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={9}>
                  <Typography color="textSecondary" variant="body2">
                    Select one of your configured tenants to get started.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Button
                      variant="contained"
                      state="primary"
                      size="large"
                      onClick={() =>
                        cmdService.executeCommand(openTenantPickerCommandId)
                      }
                    >
                      Select Tenant
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  }
  return (
    <>
      <Box pt={1} pb={4}>
        <Typography variant="h1" data-test="getting-started">
          Getting Started
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {content}
      </Grid>
    </>
  );
};

export default GettingStarted;
