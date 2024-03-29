/**
 * Copyright 2020 Opstrace, Inc.
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

import { ClientError, GraphQLClient } from "graphql-request";
import { getSdk } from "state/graphql-api-types";
export * from "state/graphql-api-types";

const endpoint =
  process.env.GRAPHQL_ENDPOINT ||
  (typeof window !== "undefined" &&
    `${window.location.protocol}//${window.location.host}/_/graphql`);

if (!endpoint) {
  throw Error("Must specify GRAPHQL_ENDPOINT env var");
}
const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

export const client = adminSecret
  ? new GraphQLClient(endpoint, {
      headers: {
        "x-hasura-admin-secret": adminSecret!
      }
    })
  : new GraphQLClient(endpoint, {
      headers: {}
    });

export type PromiseReturnType<T> = T extends PromiseLike<infer U> ? U : T;
export type ClientResponse<T extends (args?: any) => {}> = PromiseReturnType<
  ReturnType<T>
>;

export const isGraphQLClientError = (error: Error): error is ClientError => {
  return error instanceof ClientError;
};

export const getGraphQLClientErrorMessage = (error: ClientError): string => {
  try {
    return error.response.errors![0].message;
  } catch (e: any) {
    return `GraphQL Error (Code: ${error.response.status})`;
  }
};

export { gql } from "graphql-request";

export default getSdk(client);
