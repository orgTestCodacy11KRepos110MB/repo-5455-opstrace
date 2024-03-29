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

import { all, call, spawn, takeEvery, put } from "redux-saga/effects";
import * as yamlParser from "js-yaml";

import * as actions from "../actions";
import graphqlClient, {
  getGraphQLClientErrorMessage,
  isGraphQLClientError
} from "state/clients/graphqlClient";
import { updateFormStatus, updateForm } from "state/form/actions";
import { actions as notificationActions } from "client/services/Notification/reducer";

import tenantListSubscriptionManager from "./tenantListSubscription";
import uniqueId from "lodash/uniqueId";

// create a generic type
type AsyncReturnType<T extends (...args: any) => any> =
  // if T matches this signature and returns a Promise, extract
  // U (the type of the resolved promise) and use that, or...
  T extends (...args: any) => Promise<infer U>
    ? U // if T matches this signature and returns anything else, // extract the return value U and use that, or...
    : T extends (...args: any) => infer U
    ? U // if everything goes to hell, return an `any`
    : any;

export default function* tenantTaskManager() {
  const sagas = [
    tenantListSubscriptionManager,
    addTenantListener,
    deleteTenantListener,
    getAlertmanagerListener,
    updateAlertmanagerListener
  ];
  // technique to keep the root alive and spawn sagas into their
  // own retry-on-failure loop.
  // https://redux-saga.js.org/docs/advanced/RootSaga.html
  yield all(
    sagas.map(saga =>
      spawn(function* () {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (e: any) {
            console.error(e);
          }
        }
      })
    )
  );
}

function* addTenantListener() {
  yield takeEvery(actions.addTenant, addTenant);
}

function* addTenant(action: ReturnType<typeof actions.addTenant>) {
  try {
    yield graphqlClient.CreateTenants({
      tenants: [
        {
          name: action.payload
        }
      ]
    });
  } catch (error: any) {
    let message;
    if (isGraphQLClientError(error)) {
      message = getGraphQLClientErrorMessage(error);
    } else {
      message = (error as Error).message;
    }
    yield put(
      notificationActions.register({
        id: uniqueId(),
        state: "error" as const,
        title: "Could not add tenant",
        information: message
      })
    );
  }
}

function* deleteTenantListener() {
  yield takeEvery(actions.deleteTenant, deleteTenant);
}

function* deleteTenant(action: ReturnType<typeof actions.deleteTenant>) {
  try {
    yield graphqlClient.DeleteTenant({
      name: action.payload
    });
  } catch (error: any) {
    let message;
    if (isGraphQLClientError(error)) {
      message = getGraphQLClientErrorMessage(error);
    } else {
      message = (error as Error).message;
    }
    yield put(
      notificationActions.register({
        id: uniqueId(),
        state: "error" as const,
        title: "Could not delete tenant",
        information: message
      })
    );
  }
}

function* getAlertmanagerListener() {
  yield takeEvery(actions.getAlertmanager, getAlertmanager);
}

function* getAlertmanager(action: ReturnType<typeof actions.getAlertmanager>) {
  try {
    const response: AsyncReturnType<typeof graphqlClient.GetAlertmanager> =
      yield graphqlClient.GetAlertmanager({
        tenant_id: action.payload
      });

    if (response.data?.getAlertmanager?.config) {
      const cortexConfig = yamlParser.load(
        response.data?.getAlertmanager?.config,
        {
          schema: yamlParser.JSON_SCHEMA
        }
      );

      yield put(
        actions.alertmanagerLoaded({
          tenantName: action.payload,
          config: cortexConfig.alertmanager_config,
          online: true
        })
      );
    } else {
      yield put(
        actions.alertmanagerLoaded({
          tenantName: action.payload,
          config: "",
          online: true
        })
      );
    }
  } catch (err: any) {
    console.error(err);
  }
}

function* updateAlertmanagerListener() {
  yield takeEvery(actions.updateAlertmanager, updateAlertmanager);
}

// Note: until we add back in user editing of template files for the alertmanager configuration we are using the default as something valid needs to be specified
const DEFAULT_TEMPLATE_FILES = `default_template: |\n  '{{ define "__alertmanager" }}AlertManager{{ end }}\n  {{ define "__alertmanagerURL" }}{{ .ExternalURL }}/#/alerts?receiver={{ .Receiver | urlquery }}{{ end }}'`;
const template_files = yamlParser.load(DEFAULT_TEMPLATE_FILES, {
  schema: yamlParser.JSON_SCHEMA
});

function* updateAlertmanager(
  action: ReturnType<typeof actions.updateAlertmanager>
) {
  try {
    if (action.payload.formId) {
      yield put(
        updateFormStatus({
          id: action.payload.formId,
          status: "validating"
        })
      );
    }

    const config = yamlParser.dump(
      {
        template_files: template_files,
        alertmanager_config: action.payload.config
      },
      {
        schema: yamlParser.JSON_SCHEMA,
        lineWidth: -1
      }
    );

    const response: AsyncReturnType<typeof graphqlClient.UpdateAlertmanager> =
      yield graphqlClient.UpdateAlertmanager({
        tenant_id: action.payload.tenantName,
        input: { config }
      });

    if (action.payload.formId) {
      yield put(
        updateForm({
          id: action.payload.formId,
          status: "active",
          data: { remoteValidation: response?.data?.updateAlertmanager }
        })
      );
    }
  } catch (err: any) {
    console.error(err);
  }
}
