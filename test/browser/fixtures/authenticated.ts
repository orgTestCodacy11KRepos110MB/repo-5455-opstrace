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

import { Cookie } from "@playwright/test";

import { log } from "../utils";

let OPSTRACE_INSTANCE_DNS_NAME: string;

const CLUSTER_NAME: string = process.env.OPSTRACE_CLUSTER_NAME || "unknown";

// default, if OPSTRACE_INSTANCE_DNS_NAME is not set via env
OPSTRACE_INSTANCE_DNS_NAME = `${CLUSTER_NAME}.opstrace.io`;

if (process.env.OPSTRACE_INSTANCE_DNS_NAME) {
  log.info(
    "env variable OPSTRACE_INSTANCE_DNS_NAME is set: %s",
    process.env.OPSTRACE_INSTANCE_DNS_NAME
  );
  OPSTRACE_INSTANCE_DNS_NAME = process.env.OPSTRACE_INSTANCE_DNS_NAME;
}

export let CLUSTER_BASE_URL = `https://${OPSTRACE_INSTANCE_DNS_NAME}`;

if (process.env.OPSTRACE_CLUSTER_BASE_URL) {
  log.info(
    "env variable OPSTRACE_CLUSTER_BASE_URL is set: %s",
    process.env.OPSTRACE_CLUSTER_BASE_URL
  );
  CLUSTER_BASE_URL = process.env.OPSTRACE_CLUSTER_BASE_URL;
}

export const CLOUD_PROVIDER: string =
  process.env.OPSTRACE_CLOUD_PROVIDER || "unknown";

export const CI_LOGIN_EMAIL = "ci-test@opstrace.com";
export const CI_LOGIN_PASSWORD = "This-is-not-a-secret!";

type SystemFixture = {
  runningInCI: boolean;
};

const CLOUD_PROVIDER_DEFAULTS = { aws: false, gcp: false, unknown: false };

type ClusterFixture = {
  name: string;
  baseUrl: string;
  cloudProvider: Record<string, boolean>;
};

type UserFixture = {
  email: string;
};

type AuthenticationFixture = {
  system: SystemFixture;
  cluster: ClusterFixture;
  user: UserFixture;
  authCookies: Cookie[];
};

export const addAuthFixture = test =>
  test.extend<Record<string, never>, AuthenticationFixture>({
    system: [
      async ({ browser }, use) => {
        const system: SystemFixture = {
          runningInCI: process.env.BUILDKITE === "true"
        };
        await use(system);
      },
      { scope: "worker" }
    ],
    cluster: [
      async ({ browser }, use) => {
        const cluster: ClusterFixture = {
          name: CLUSTER_NAME,
          baseUrl: CLUSTER_BASE_URL,
          cloudProvider: CLOUD_PROVIDER_DEFAULTS
        };
        cluster.cloudProvider[CLOUD_PROVIDER] = true;
        await use(cluster);
      },
      { scope: "worker" }
    ],
    user: [
      async ({ browser }, use) => {
        const user: UserFixture = {
          email: CI_LOGIN_EMAIL
        };
        await use(user);
      },
      { scope: "worker" }
    ],
    authCookies: [
      async ({ browser }, use) => {
        if (!CLUSTER_BASE_URL) {
          log.error(
            "env variables OPSTRACE_CLUSTER_NAME or OPSTRACE_CLUSTER_BASE_URL must be set"
          );
          process.exit(1);
        }

        if (!CLOUD_PROVIDER) {
          log.error(
            "env variable OPSTRACE_CLOUD_PROVIDER must be set to `aws` or `gcp`"
          );
          process.exit(1);
        }

        const context = await browser.newContext({ ignoreHTTPSErrors: true });
        const page = await context.newPage();

        await page.goto(CLUSTER_BASE_URL);

        // <button class="MuiButtonBase-root Mui... MuiButton-sizeLarge" tabindex="0" type="button">
        // <span class="MuiButton-label">Log in</span>
        await page.waitForSelector("css=button");

        await page.click("text=Log in");

        // Wait for CI-specific username/pw login form to appear
        await page.waitForSelector("text=Don't remember your password?");

        await page.fill("css=input[type=email]", CI_LOGIN_EMAIL);
        await page.fill("css=input[type=password]", CI_LOGIN_PASSWORD);

        await page.click("css=button[type=submit]");

        // The first view after successful login is expected to be the details page
        // for the `system` tenant, showing a link to Grafana.
        await page.waitForSelector("[data-test=getting-started]");

        const cookies = await page.context().cookies();
        await page.close();

        await use(cookies);
      },
      { scope: "worker", auto: true }
    ]
  });
