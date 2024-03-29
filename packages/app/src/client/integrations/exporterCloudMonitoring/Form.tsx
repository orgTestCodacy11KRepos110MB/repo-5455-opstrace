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
import { useForm, useFormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { exporterCloudMonitoringIntegration as integrationDef } from "./index";

import { ControlledInput } from "client/components/Form/ControlledInput";

import { Card, CardContent, CardHeader } from "client/components/Card";
import { Box } from "client/components/Box";
import { Button } from "client/components/Button";
import { Typography } from "client/components/Typography";
import { ExternalLink } from "client/components/Link";
import { FormProps } from "../types";

const Schema = yup.object({
  name: yup.string().required(),
  // GCP credentials are in a JSON file. We pass it through as-is.
  credentials: yup.string().required(),
  // See list of properties: https://github.com/prometheus-community/stackdriver_exporter#flags
  // "web.listen-address" and "web.telemetry-path" are assigned by the controller cannot be overridden here.
  googleProjectId: yup.string().required(),
  monitoringMetricsTypePrefixes: yup.string().required(),
  monitoringMetricsInterval: yup.string().required(),
  monitoringMetricsOffset: yup.string().required()
});

type Values = yup.Asserts<typeof Schema>;

const defaultValues: Values = {
  name: "",
  credentials: "",
  googleProjectId: "",
  monitoringMetricsTypePrefixes: "",
  monitoringMetricsInterval: "5m",
  monitoringMetricsOffset: "0s"
};

type FormData = {
  credentials: string;
  config: {
    "google.project-id": Array<string>;
    "monitoring.metrics-type-prefixes": Array<string>;
    "monitoring.metrics-interval": string;
    "monitoring.metrics-offset": string;
  };
};

export const ExporterCloudMonitoringForm = ({
  handleCreate
}: FormProps<FormData>) => {
  const { handleSubmit, control } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaultValues,
    resolver: yupResolver(Schema)
  });

  const { isValid } = useFormState({
    control
  });

  const onSubmit = (data: Values) => {
    handleCreate(
      {
        name: data.name,
        data: {
          credentials: data.credentials,
          config: {
            "google.project-id": data.googleProjectId
              .split(",")
              .map(id => id.trim()),
            "monitoring.metrics-type-prefixes": data.monitoringMetricsTypePrefixes
              .split(",")
              .map(prefix => prefix.trim()),
            "monitoring.metrics-interval": data.monitoringMetricsInterval,
            "monitoring.metrics-offset": data.monitoringMetricsOffset
          }
        }
      },
      { createGrafanaFolder: false }
    );
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexWrap="wrap"
      p={1}
    >
      <Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: "h5" }}
              title={`Install ${integrationDef.label} Integration`}
            />
            <CardContent>
              <Box mb={3} mt={2}>
                <ControlledInput
                  name="name"
                  control={control}
                  inputProps={{ fullWidth: true, autoFocus: true }}
                  label="Integration Name"
                  helperText="An identifier for this integration"
                />
              </Box>
              <Box mb={3}>
                <ControlledInput
                  name="credentials"
                  control={control}
                  inputProps={{
                    fullWidth: true,
                    multiline: true,
                    rows: 5,
                    rowsMax: 5
                  }}
                  label="Service Account Credentials JSON"
                  helperText={
                    <span>
                      Important: these credentials are stored as plain text.
                      Please refer to the{" "}
                      <ExternalLink
                        target="_blank"
                        href="https://github.com/prometheus-community/stackdriver_exporter#user-content-credentials-and-permissions"
                      >
                        documentation
                      </ExternalLink>{" "}
                      for info about the needed permissions.
                    </span>
                  }
                />
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1">Configuration Flags</Typography>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom={true}
                >
                  See the{" "}
                  <ExternalLink
                    target="_blank"
                    href="https://github.com/prometheus-community/stackdriver_exporter#flags"
                  >
                    documentation
                  </ExternalLink>{" "}
                  for further details
                </Typography>
              </Box>

              <Box mb={3}>
                <ControlledInput
                  name="googleProjectId"
                  control={control}
                  inputProps={{ fullWidth: true }}
                  label="google.project-id"
                  helperText="Comma-separated list of Google Project IDs, autodetected if empty"
                />
              </Box>
              <Box mb={3}>
                <ControlledInput
                  name="monitoringMetricsTypePrefixes"
                  control={control}
                  inputProps={{
                    fullWidth: true,
                    multiline: true,
                    rows: 10,
                    rowsMax: 10
                  }}
                  label="monitoring.metrics-type-prefixes"
                  helperText="Comma-separated Google Stackdriver Monitoring Metric Type prefixes"
                />
              </Box>
              <Box mb={3}>
                <ControlledInput
                  name="monitoringMetricsInterval"
                  control={control}
                  inputProps={{ fullWidth: true }}
                  label="monitoring.metrics-interval"
                  helperText="Metric timestamp interval to request from the Google Stackdriver Monitoring Metrics API"
                />
              </Box>
              <Box mb={3}>
                <ControlledInput
                  name="monitoringMetricsOffset"
                  control={control}
                  inputProps={{ fullWidth: true }}
                  label="monitoring.metrics-offset"
                  helperText="Offset (into the past) for the metric's timestamp interval, to handle latency in published metrics"
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                state="primary"
                size="large"
                disabled={!isValid}
              >
                Install
              </Button>
            </CardContent>
          </Card>
        </form>
      </Box>
    </Box>
  );
};

export default ExporterCloudMonitoringForm;
