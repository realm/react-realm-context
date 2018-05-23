import React, { Component } from 'react';
import { RealmProvider, RealmConsumer, RealmInitializer } from 'react-realm-context';

import { SomeDeeplyNestedComponent } from './SomeDeeplyNestedComponent';

export const App = () => (
  <RealmProvider schema={[{ name: 'Person', properties: { name: 'string' } }]}>
    <RealmInitializer>
      {({ realm }) => {
        realm.create('Person', { name: 'John Doe' });
      }}
    </RealmInitializer>
    <SomeDeeplyNestedComponent />
  </RealmProvider>
);
