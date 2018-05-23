import React, { Component } from 'react';
import { RealmProvider } from 'react-realm-context';

export const App = () => (
  <RealmProvider schema={[{ name: 'Person', properties: { name: 'string' } }]}>
    {({ realm }) => {
      if (realm.empty) {
        realm.write(() => {
          realm.create('Person', { name: 'John Doe' });
        });
      }
      return realm.objects('Person').map(person => person.name).join(', ');
    }}
  </RealmProvider>
);
