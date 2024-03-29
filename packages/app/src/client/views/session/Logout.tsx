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

import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useAxios from "axios-hooks";

import { loginUrl } from "client/components/withSession/paths";

import { LoadingPage } from "./Loading";

export const LogoutPage = () => {
  const { logout } = useAuth0();
  const [{ loading }] = useAxios({
    url: "/_/auth/logout",
    method: "POST",
    withCredentials: true
  });

  useEffect(() => {
    if (!loading) {
      logout({
        returnTo: loginUrl()
      });
    }
  }, [loading, logout]);

  return <LoadingPage stage="logout" />;
};
