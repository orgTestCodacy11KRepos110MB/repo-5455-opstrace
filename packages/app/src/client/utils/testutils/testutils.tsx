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

import React, { ReactNode, useEffect, useState } from "react";
import { render as rtlRender, RenderResult } from "@testing-library/react";
import { History, createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import UE from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createMainStore } from "state/store";
import "@testing-library/jest-dom";
import ThemeProvider from "client/themes/Provider";
import light from "client/themes/light";
import Services from "client/services";
import { useCommandService } from "client/services/Command";

export type RenderOptions = {
  // optionally pass in a history object to control routes in the test
  history?: History;
};

type WrapperProps = {
  children?: React.ReactNode;
};

export function render(
  ui: React.ReactNode,
  renderOptions?: RenderOptions
): RenderResult {
  function Wrapper({ children }: WrapperProps) {
    return (
      <React.StrictMode>
        <Router
          history={
            (renderOptions && renderOptions.history) || createMemoryHistory()
          }
        >
          {children}
        </Router>
      </React.StrictMode>
    );
  }

  return rtlRender(<div>{ui}</div>, { wrapper: Wrapper, ...renderOptions });
}

export const renderWithEnv = (
  children: React.ReactNode,
  { store = createMainStore(), history = createMemoryHistory() } = {}
) => {
  return rtlRender(
    <Provider store={store}>
      <ThemeProvider theme={light}>
        <Services>
          <Router history={history}>{children}</Router>
        </Services>
      </ThemeProvider>
    </Provider>
  );
};

export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export const CommandServiceTrigger = ({
  children,
  commandId
}: {
  children: ReactNode;
  commandId: string;
}) => {
  const cmdService = useCommandService();
  const [commandServiceReady, setCommandServiceReady] = useState(false);
  useEffect(() => {
    // CommandService is not ready on first render, as commands havent been registered yet.
    // This will retriger the command service on second render cycle.
    setCommandServiceReady(true);
  }, []);
  useEffect(() => {
    cmdService.executeCommand(commandId);
  }, [commandServiceReady, cmdService, commandId]);
  return <>{children}</>;
};

// re-export everything
export * from "@testing-library/react";
export const userEvent = UE;
