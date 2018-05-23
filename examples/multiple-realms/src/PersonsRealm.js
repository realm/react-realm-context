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

const PersonsRealmProvider = ({ children }) => (
  <RealmProvider
    path="persons.realm"
    schema={[ PersonSchema ]}
    children={children}
  />
);

export {
  PersonsRealmProvider,
  RealmConsumer as PersonsRealmConsumer,
};
