import * as React from 'react';
import * as Realm from 'realm';

export type RealmRenderer = (context: IRealmContext) => React.ReactNode;

import { generateRealmConsumer, IRealmConsumerProps } from './RealmConsumer';
import {
  generateRealmInitializer,
  IRealmInitializerProps,
} from './RealmInitializer';
import { generateRealmProvider, IRealmProviderProps } from './RealmProvider';
import { generateRealmQuery, IRealmQueryProps, Sorting } from './RealmQuery';

export {
  IRealmConsumerProps,
  IRealmInitializerProps,
  IRealmProviderProps,
  IRealmQueryProps,
};

export interface IRealmContext {
  realm: Realm;
}

const createRealmContext = () => {
  const context = React.createContext<IRealmContext>(null);
  const Provider = generateRealmProvider(context.Provider);
  const Consumer = generateRealmConsumer(context.Consumer);
  const Query = generateRealmQuery(Consumer);
  const Initializer = generateRealmInitializer(Consumer);
  return {
    RealmProvider: Provider,
    RealmConsumer: Consumer,
    RealmQuery: Query,
    RealmInitializer: Initializer,
  };
};

// Export a function that creates Realm contexts
export { createRealmContext, Sorting as RealmSorting };

// Create and export default RealmProvider and RealmConsumer
const {
  RealmProvider,
  RealmConsumer,
  RealmQuery,
  RealmInitializer,
} = createRealmContext();

export { RealmProvider, RealmConsumer, RealmQuery, RealmInitializer };
