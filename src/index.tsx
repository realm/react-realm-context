import * as React from 'react';
import * as Realm from 'realm';

import { generateRealmProvider } from './RealmProvider';

export interface IRealmContext {
  realm: Realm;
}

const createRealmContext = () => {
  const { Provider, Consumer } = React.createContext<IRealmContext>(null);
  const RealmProvider = generateRealmProvider(Provider);
  return { RealmProvider, RealmConsumer: Consumer };
};

export { createRealmContext };
export { withRealm } from './withRealm';
