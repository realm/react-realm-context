import React, { Component } from 'react';
import { RealmConsumer } from 'react-realm-context';

export const SomeDeeplyNestedComponent = () => (
  <RealmConsumer>
    {({ realm }) => {
      if (realm.empty) {
        realm.write(() => {
          realm.create('Person', { name: 'John Doe' });
        });
      }
      return realm.objects('Person').map(person => person.name).join(', ');
    }}
  </RealmConsumer>
);
