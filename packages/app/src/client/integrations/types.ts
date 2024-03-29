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

import { Integration } from "state/integration/types";
import { Tenant } from "state/tenant/types";

export type NewIntegration<Data> = {
  name: string;
  data: Data;
};

export type NewIntegrationOptions = {
  createGrafanaFolder?: boolean;
};

export type FormProps<Data> = {
  handleCreate: (
    data: NewIntegration<Data>,
    options?: NewIntegrationOptions
  ) => void;
};

export type ShowProps = {};

export type StatusProps = {
  integration: Integration;
  tenant: Tenant;
};

export type IntegrationDef<FormData = {}> = {
  kind: string;
  category: string;
  label: string;
  desc: React.ReactNode;
  Form: React.ComponentType<FormProps<FormData>>;
  Show: React.ComponentType<ShowProps>;
  Status: React.ComponentType<StatusProps>;
  enabled: boolean;
  Logo?: string;
};

export type IntegrationDefs = IntegrationDef[];
export type IntegrationDefRecords = Record<string, IntegrationDef>;
