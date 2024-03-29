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

import { Button } from "client/components/Button";
import React, { ReactNode } from "react";
import { useSimpleNotification } from "client/services/Notification";
import { saveAs } from "file-saver";

type Props = {
  children: ReactNode;
  config: string;
  filename: string;
};

export const downloadConfigYaml = (filename: string, content: string) => {
  var configBlob = new Blob([content], {
    type: "application/x-yaml;charset=utf-8"
  });
  saveAs(configBlob, filename);
};

const DownloadConfigButton = (props: Props) => {
  const { registerNotification } = useSimpleNotification();
  const handleClick = () => {
    try {
      downloadConfigYaml(props.filename, props.config);
    } catch (error: any) {
      registerNotification({
        state: "error" as const,
        title: "Could not download YAML",
        information: error.message
      });
    }
  };
  return (
    <Button
      style={{ marginRight: 20 }}
      variant="contained"
      size="small"
      state="primary"
      onClick={handleClick}
    >
      {props.children}
    </Button>
  );
};

export default DownloadConfigButton;
