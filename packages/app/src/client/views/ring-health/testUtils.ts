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

import { Shard } from "./RingTable";

// shard to be used as mock request response
export const createMockShard = (id: string): Required<Shard> => ({
  id: `shard-id-${id}`,
  state: `shard-state-${id}`,
  timestamp: "2021-08-04 05:16:17 +0000 UTC",
  zone: `shard-zone-${id}`,
  address: `shard-address-${id}`,
  tokens: [],
  registered_timestamp: `shard-registered_timestamp-${id}`
});
