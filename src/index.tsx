import * as React from 'react';
import * as Realm from 'realm';

export type RealmRenderer = (context: IRealmContext) => React.ReactNode;

import { generateRealmProvider } from './RealmProvider';
import { generateRealmConsumer } from './RealmConsumer';
import { generateRealmQuery, Sorting } from './RealmQuery';
import { generateRealmInitializer } from './RealmInitializer';

export interface IRealmContext {
  realm: Realm;
}

const createRealmContext = () => {
  const { Provider, Consumer } = React.createContext<IRealmContext>(null);
  const RealmProvider = generateRealmProvider(Provider);
  const RealmConsumer = generateRealmConsumer(Consumer);
  const RealmQuery = generateRealmQuery(Consumer);
  const RealmInitializer = generateRealmInitializer(Consumer);
  return { RealmProvider, RealmConsumer, RealmQuery, RealmInitializer };
};

// Export a function that creates Realm contexts
export {
  createRealmContext,
  Sorting as RealmSorting,
};

// Create and export default RealmProvider and RealmConsumer
const {
  RealmProvider,
  RealmConsumer,
  RealmQuery,
  RealmInitializer
} = createRealmContext();

export {
  RealmProvider,
  RealmConsumer,
  RealmQuery,
  RealmInitializer,
};
