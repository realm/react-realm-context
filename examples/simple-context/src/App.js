import React, { Component } from 'react';
import { RealmProvider } from 'react-realm-context';

import { SomeDeeplyNestedComponent } from './SomeDeeplyNestedComponent';

export const App = () => (
  <RealmProvider schema={[{ name: 'Person', properties: { name: 'string' } }]}>
    <SomeDeeplyNestedComponent />
  </RealmProvider>
);
