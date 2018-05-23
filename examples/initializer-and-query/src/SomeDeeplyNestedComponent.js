import React, { Component } from 'react';
import { RealmQuery } from 'react-realm-context';

export const SomeDeeplyNestedComponent = () => (
  <RealmQuery type="Person">
    {({ results }) => results.map(person => person.name).join(', ')}
  </RealmQuery>
);
