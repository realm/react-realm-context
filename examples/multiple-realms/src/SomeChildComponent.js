import React from 'react';

import { CarsRealmConsumer } from './CarsRealm';
import { PersonsRealmConsumer } from './PersonsRealm';

export const SomeChildComponent = () => (
  <CarsRealmConsumer>
    {({ realm: carRealm }) => (
      <PersonsRealmConsumer>
        {({ realm: personRealm }) => {
          const isCarsRealmReady = !carRealm.isClosed && carRealm.empty;
          const isPersonsRealmReady = !personRealm.isClosed && personRealm.empty;
          return `${isPersonsRealmReady} ${isCarsRealmReady}`;
        }}
      </PersonsRealmConsumer>
    )}
  </CarsRealmConsumer>
);
