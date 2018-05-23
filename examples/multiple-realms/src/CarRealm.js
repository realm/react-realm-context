import React from 'react';
import { createRealmContext } from 'react-realm-context';

const { RealmProvider, RealmConsumer } = createRealmContext();

const CarSchema = {
  name: 'Car',
  properties: {
    model: 'string',
    doors: 'int'
  }
};

const CarRealmProvider = ({ children }) => (
  <RealmProvider
    path="cars.realm"
    schema={[ CarSchema ]}
    children={children}
  />
);

export {
  CarRealmProvider,
  RealmConsumer as CarRealmConsumer,
};
