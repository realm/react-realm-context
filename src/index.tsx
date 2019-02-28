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

import React from 'react';
import Realm from 'realm';

import { generateRealmConnection } from './RealmConnection';
import { generateRealmConsumer, IRealmConsumerProps } from './RealmConsumer';
import {
  generateRealmInitializer,
  IRealmInitializerProps,
} from './RealmInitializer';
import {
  generateRealmProgress,
  IRealmProgressProps,
  IRealmProgressValue,
} from './RealmProgress';
import { generateRealmProvider, IRealmProviderProps } from './RealmProvider';
import { generateRealmQuery, IRealmQueryProps, Sorting } from './RealmQuery';
import { generateWithRealm } from './withRealm';

export {
  IRealmConsumerProps,
  IRealmInitializerProps,
  IRealmProviderProps,
  IRealmProgressProps,
  IRealmProgressValue,
  IRealmQueryProps,
};

/**
 * The context passed from a RealmProvider to any of its RealmConsumer
 */
export interface IRealmContext {
  realm: Realm;
}

const createRealmContext = () => {
  const context = React.createContext<IRealmContext>(null);
  const Consumer = generateRealmConsumer(context.Consumer);
  return {
    RealmProvider: generateRealmProvider(context.Provider),
    RealmConsumer: Consumer,
    RealmQuery: generateRealmQuery(Consumer),
    RealmInitializer: generateRealmInitializer(Consumer),
    RealmConnection: generateRealmConnection(Consumer),
    RealmProgress: generateRealmProgress(Consumer),
    withRealm: generateWithRealm(Consumer),
  };
};

// Export a function that creates Realm contexts
export { createRealmContext, Sorting as RealmSorting };

// Create and export default RealmProvider and RealmConsumer
const {
  /**
   * The default RealmProvider.
   *
   * If you're opening multiple Realms create separate contexts using {@link createRealmContext}.
   */
  RealmProvider,

  /**
   * The default RealmConsumer, which will get its Realm from the default RealmProvider.
   *
   * If you're opening multiple Realms create separate contexts using {@link createRealmContext}.
   */
  RealmConsumer,

  /**
   * The default RealmQuery, which will get its Realm from the default RealmProvider.
   *
   * If you're opening multiple Realms create separate contexts using {@link createRealmContext}.
   */
  RealmQuery,

  /**
   * The default RealmInitializer, which will get its Realm from the default RealmProvider.
   *
   * If you're opening multiple Realms create separate contexts using {@link createRealmContext}.
   */
  RealmInitializer,

  /**
   * The default RealmConnection, which will get its Realm from the default RealmProvider.
   *
   * If you're opening multiple Realms create separate contexts using {@link createRealmContext}.
   */
  RealmConnection,

  /**
   * The default RealmProgress, which will get its Realm from the default RealmProvider.
   *
   * If you're opening multiple Realms create separate contexts using {@link createRealmContext}.
   */
  RealmProgress,

  /**
   * The default withRealm HOC, which will get its Realm from the default RealmProvider.
   *
   * If you're opening multiple Realms create separate contexts using {@link createRealmContext}.
   */
  withRealm,
} = createRealmContext();

export {
  RealmProvider,
  RealmConsumer,
  RealmQuery,
  RealmInitializer,
  RealmConnection,
  RealmProgress,
  withRealm,
};
