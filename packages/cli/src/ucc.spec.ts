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

import fs from "fs";

// mock logger and die functions
const mockDie = jest.fn().mockImplementation(e => {
  throw new Error(e);
});

const BUILD_INFO = {
  BRANCH_NAME: "testbranch",
  VERSION_STRING: "testversion",
  COMMIT: "testcommit",
  BUILD_TIME_RFC3339: "testtime",
  BUILD_HOSTNAME: "testhost"
};

jest.mock("@opstrace/utils", () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn()
  },
  // also needs to be mocked
  BUILD_INFO: BUILD_INFO,
  die: mockDie
}));

//import { BUILD_INFO } from "@opstrace/utils";

import {
  LatestAWSInfraConfigType,
  LatestGCPInfraConfigType
} from "@opstrace/config";

import { LatestClusterConfigFileSchemaType } from "./schemas";

import { uccGetAndValidate } from "./ucc";

let tmpDir = "";

beforeAll(() => {
  // create temp dir to store config files used in the tests
  tmpDir = fs.mkdtempSync("ucctests");
});

afterAll(() => {
  // cleanup the temp dir
  fs.rmSync(tmpDir, { recursive: true });
});

beforeEach(() => {
  jest.clearAllMocks();
});

test("[AWS] should parse and validate latest cluster config file with defaults", async () => {
  const filename = tmpDir + "/" + "aws-test.yaml";
  const configFile = `
tenants:
- prod
- dev
env_label: unit-tests
node_count: 3
custom_auth0_domain: foo
custom_auth0_client_id: bar
custom_dns_name: foobar
`;
  fs.writeFileSync(filename, configFile);

  const [userClusterConfig, infraConfigAWS, infraConfigGCP]: [
    LatestClusterConfigFileSchemaType,
    LatestAWSInfraConfigType | undefined,
    LatestGCPInfraConfigType | undefined
  ] = await uccGetAndValidate(filename, "aws");

  expect(userClusterConfig).toEqual({
    cert_issuer: "letsencrypt-prod",
    controller_image: `opstrace/controller:${BUILD_INFO.VERSION_STRING}`,
    data_api_authentication_disabled: false,
    data_api_authorized_ip_ranges: ["0.0.0.0/0"],
    env_label: "unit-tests",
    log_retention_days: 7,
    metric_retention_days: 7,
    node_count: 3,
    tenants: ["prod", "dev"],
    custom_auth0_client_id: "bar",
    custom_auth0_domain: "foo",
    custom_dns_name: "foobar"
  });

  expect(infraConfigAWS).toEqual({
    eks_admin_roles: [],
    instance_type: "t3.xlarge",
    region: "us-west-2",
    zone_suffix: "a"
  });
  expect(infraConfigGCP).toBeUndefined();
});

test("should fail to parse invalid config file", async () => {
  const filename = tmpDir + "/" + "invalid-test.yaml";
  const configFile = `
random string
  `;
  fs.writeFileSync(filename, configFile);

  const expectedErr = new Error(
    'invalid instance config document: this must be a `object` type, but the final value was: `"random string"`.'
  );

  try {
    await uccGetAndValidate(filename, "aws");
  } catch (e: any) {
    expect(e).toEqual(expectedErr);
  }

  try {
    await uccGetAndValidate(filename, "gcp");
  } catch (e: any) {
    expect(e).toEqual(expectedErr);
  }

  expect(mockDie).toBeCalledTimes(2);
});
