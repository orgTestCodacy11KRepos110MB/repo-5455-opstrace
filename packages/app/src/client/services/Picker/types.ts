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
import { ReactNode } from "react";

export type PickerOption<Data = any> = {
  id: string;
  text: string;
  data?: Data;
};

export type PickerListProps = {
  selectedIndex: number;
  options: PickerOption[];
  onSelect: (selectedOption: PickerOption) => void;
  secondaryAction?: (option: PickerOption) => ReactNode;
};

export type PickerProvider = {
  title?: string;
  // Disable's the filtering of options
  disableFilter?: boolean;
  // Disable input
  disableInput?: boolean;
  // Validate input as user is typing, return "true" if valid or an error message to display to the user
  textValidator?: (text: string) => true | string;
  activationPrefix: string;
  onSelected: (option: PickerOption, inputText?: string) => void;
  options: PickerOption[];
  secondaryAction?: (option: PickerOption) => ReactNode;
  dataTest?: string;
};

export type PickerApi = {
  register: (provider: PickerProvider) => void;
  unregister: (provider: PickerProvider) => void;
  setText: (text: string) => void;
};

export type PickerState = {
  activeProviderIndex: number;
  text: null | string;
  providers: PickerProvider[];
};
