import React from 'react';
import { createRealmContext } from 'react-realm-context';

const { RealmProvider, RealmConsumer } = createRealmContext();

const PersonSchema = {
  name: 'Person',
  properties: {
    name: 'string',
    age: 'int'
  }
};

const PersonRealmProvider = ({ children }) => (
  <RealmProvider
    path="person.realm"
    schema={[ PersonSchema ]}
    children={children}
  />
);

export {
  PersonRealmProvider,
  RealmConsumer as PersonRealmConsumer,
};
