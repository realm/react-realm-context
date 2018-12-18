////////////////////////////////////////////////////////////////////////////
//
// Copyright 2018 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

import * as React from 'react';
import * as Realm from 'realm';

import { IRealmContext } from '.';

/**
 * Props passed to a RealmInitializer component.
 */
export interface IRealmInitializerProps {
  children: ({ realm }: { realm: Realm }) => void;
}

/**
 * Generates a RealmInitializer wrapping a context consumer.
 * Use `createContext` instead of using this directly.
 */
export const generateRealmInitializer = (
  WrappedConsumer: React.Consumer<IRealmContext>,
) => {
  const RealmInitializer = ({ children }: IRealmInitializerProps) => (
    <WrappedConsumer>
      {({ realm }) => {
        // If the realm is empty - call the function provided as child to initialize the Realm
        if (realm.empty) {
          realm.write(() => {
            children({ realm });
          });
        }
        return null;
      }}
    </WrappedConsumer>
  );
  return RealmInitializer;
};
