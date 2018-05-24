import * as React from 'react';
import * as Realm from 'realm';

import { IRealmContext } from '.';

export interface IRealmInitializerProps {
  children: ({ realm }: { realm: Realm }) => void;
}

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
