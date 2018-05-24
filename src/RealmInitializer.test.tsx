import * as assert from 'assert';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { IPerson, schema } from '../utils/persons-realm';

import { RealmConsumer, RealmInitializer, RealmProvider } from '.';

describe('RealmInitializer', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('will initialize the Realm with data', () => {
    let realmReference: Realm;

    tree = renderer.create(
      <RealmProvider schema={schema}>
        <RealmInitializer>
          {({ realm }) => {
            realm.create('Person', { name: 'Bobby Boy' });
          }}
        </RealmInitializer>
        <RealmConsumer>
          {({ realm }) => {
            // Hang onto the realm for the test
            realmReference = realm;
            return realm
              .objects<IPerson>('Person')
              .map(person => person.name)
              .join(', ');
          }}
        </RealmConsumer>
      </RealmProvider>,
    );

    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), 'Bobby Boy');
    // Unmounting should close the Realm
    tree.unmount();
    tree = null;
    // Check that unmounting did indeed close the Realm
    assert.equal(realmReference.isClosed, true, 'the Realm was not closed');
  });
});
