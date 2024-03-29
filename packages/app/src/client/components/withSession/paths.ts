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

// note: these are all functions rather than values so as to only be calculated
// when used there were problems with the window.location sometimes not being
// initialised when working out the rootUrl as value on js being loaded in the
// browser. For example this would result in loginUrl being: http:///login

export const rootUrl = () =>
  window.location.href.split(window.location.pathname)[0];

export const makeUrl = (pathname: string) =>
  `${rootUrl()}${pathname.startsWith("/") ? "" : "/"}${pathname}`;

export const loginPath = () => "/login";
export const loginUrl = () => makeUrl(loginPath());
