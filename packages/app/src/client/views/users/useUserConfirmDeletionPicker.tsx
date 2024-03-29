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

import { usePickerService } from "client/services/Picker";
import { useDispatch } from "react-redux";
import { deleteUser } from "state/user/actions";
import { User } from "state/user/types";

const useUserConfirmDeletionPicker = (user?: User) => {
  const dispatch = useDispatch();
  return usePickerService(
    {
      title: `Delete ${user?.email}?`,
      activationPrefix: "delete user?:",
      disableFilter: true,
      disableInput: true,
      options: [
        {
          id: "yes",
          text: "yes"
        },
        {
          id: "no",
          text: "no"
        }
      ],
      onSelected: option => {
        if (option.id === "yes" && user) dispatch(deleteUser(user.id));
      }
    },
    [user]
  );
};

export default useUserConfirmDeletionPicker;
