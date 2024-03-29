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

import { WebSocketLink } from "@apollo/client/link/ws";
import { onError } from "@apollo/client/link/error";
import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
  from
} from "@apollo/client";

export * from "state/graphql-api-types";

// we use webpack to set these "false" during client build
const headers = process.env.HASURA_GRAPHQL_ADMIN_SECRET
  ? {
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET
    }
  : {};

const endpoint = `${window.location.protocol === "https:" ? "wss" : "ws"}://${
  window.location.host
}/_/graphql`;

export type PromiseReturnType<T> = T extends PromiseLike<infer U> ? U : T;
export type ClientResponse<T extends (args?: any) => {}> = PromiseReturnType<
  ReturnType<T>
>;

// TODO: improve this. Just a way to see all errors in the console for now
const subscriptionErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.warn(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

let subscriptionClient: ApolloClient<NormalizedCacheObject> | null = null;

export const startSubscriptionClient = () => {
  const wsLink = new WebSocketLink({
    uri: endpoint,
    options: {
      reconnect: true,
      lazy: false,
      connectionParams: {
        headers
      }
    }
  });

  subscriptionClient = new ApolloClient({
    cache: new InMemoryCache({
      resultCaching: false
    }),
    link: from([subscriptionErrorLink, wsLink])
  });

  return subscriptionClient;
};

export const stopSubscriptionClient = () => {
  subscriptionClient = null;
};

const getSubscriptionClient: () => ApolloClient<NormalizedCacheObject> = () =>
  subscriptionClient ?? startSubscriptionClient();

export default getSubscriptionClient;
export { endpoint, headers };
