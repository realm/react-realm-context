import React from 'react';

import { CarRealmConsumer } from './CarRealm';
import { PersonRealmConsumer } from './PersonRealm';

export const SomeChildComponent = () => (
  <CarRealmConsumer>
    {({ realm: carRealm }) => (
      <PersonRealmConsumer>
        {({ realm: personRealm }) => {
          const isCarRealmReady = !carRealm.isClosed && carRealm.empty;
          const isPersonRealmReady = !personRealm.isClosed && personRealm.empty;
          return `${isPersonRealmReady} ${isCarRealmReady}`;
        }}
      </PersonRealmConsumer>
    )}
  </CarRealmConsumer>
);
