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

import React, { useMemo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { format, parseISO } from "date-fns";

import { installedIntegrationsPath } from "client/integrations/paths";
import { grafanaUrl } from "client/utils/grafana";

import { prometheusYaml } from "./templates/config";

import Status from "client/integrations/k8sMetrics/Status";

import { useSelectedTenantWithFallback } from "state/tenant/hooks/useTenant";
import { useSelectedIntegration } from "state/integration/hooks";
import { integrationDefRecords } from "client/integrations";
import { loadGrafanaStateForIntegration } from "state/integration/actions";

import { InstallInstructions } from "./InstallInstructions";
import { ReinstallInstructions } from "./ReinstallInstructions";
import { UninstallInstructions } from "./UninstallInstructions";

import { Box } from "client/components/Box";
import Attribute from "client/components/Attribute";
import { Card, CardContent, CardHeader } from "client/components/Card";
import { Button } from "client/components/Button";
import { ExternalLink } from "client/components/Link";
import { ArrowLeft } from "react-feather";

export const K8sMetricsShow = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const tenant = useSelectedTenantWithFallback();
  const integration = useSelectedIntegration();

  useEffect(() => {
    if (integration?.id)
      dispatch(loadGrafanaStateForIntegration({ id: integration.id }));
  }, [dispatch, integration?.id]);

  const isDashboardInstalled = useMemo(
    () => !!integration?.grafana?.folder?.id,
    [integration?.grafana?.folder?.id]
  );

  const config = useMemo(() => {
    if (integration?.id) {
      return prometheusYaml({
        clusterHost: window.location.host,
        tenantName: tenant.name,
        integrationId: integration.id,
        deployNamespace: integration.data.deployNamespace
      });
    }
    return "";
  }, [tenant.name, integration?.id, integration?.data.deployNamespace]);

  if (!integration) {
    // TODO: add loading or NotFound here
    return null;
  }

  const integrationDef = integrationDefRecords[integration.kind];

  return (
    <>
      <Box width="100%" height="100%" p={1}>
        <Box mb={2}>
          <Button
            size="small"
            startIcon={<ArrowLeft />}
            onClick={() => history.push(installedIntegrationsPath({ tenant }))}
          >
            Installed Integrations
          </Button>
        </Box>
        <Card>
          <CardHeader
            avatar={
              <img src={integrationDef.Logo} width={80} height={80} alt="" />
            }
            titleTypographyProps={{ variant: "h1" }}
            title={integration.name}
            action={
              <Box ml={3} display="flex" flexWrap="wrap">
                <Box p={1}>
                  <Status integration={integration} tenant={tenant} />
                </Box>
              </Box>
            }
          />
          <CardContent>
            <Box display="flex">
              <Box display="flex" flexDirection="column">
                <Attribute.Key>Integration:</Attribute.Key>
                <Attribute.Key>Created:</Attribute.Key>
                {isDashboardInstalled && <Attribute.Key> </Attribute.Key>}
              </Box>
              <Box display="flex" flexDirection="column" flexGrow={1}>
                <Attribute.Value>{integrationDef.label}</Attribute.Value>
                <Attribute.Value>
                  {format(parseISO(integration.created_at), "Pppp")}
                </Attribute.Value>
              </Box>
              {isDashboardInstalled && (
                <Attribute.Key>
                  <ExternalLink
                    target="_blank"
                    href={`${grafanaUrl({ tenant })}${
                      integration.grafana?.folder?.path
                    }`}
                  >
                    <Button state="primary" variant="outlined" size="medium">
                      View Grafana Dashboards
                    </Button>
                  </ExternalLink>
                </Attribute.Key>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
      <InstallInstructions
        integration={integration}
        tenant={tenant}
        isDashboardInstalled={isDashboardInstalled}
        config={config}
      />
      <ReinstallInstructions
        integration={integration}
        tenant={tenant}
        isDashboardInstalled={isDashboardInstalled}
      />
      <UninstallInstructions
        integration={integration}
        tenant={tenant}
        isDashboardInstalled={isDashboardInstalled}
        config={config}
      />
    </>
  );
};
