////////////////////////////////////////////////////////////////////////////
//
// Copyright 2018 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

import assert from 'assert';
import React from 'react';
import renderer from 'react-test-renderer';

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
            // Hang onto the realm for the test
            realmReference = realm;
            realm.create('Person', { name: 'Bobby Boy' });
          }}
        </RealmInitializer>
        <RealmConsumer>
          {({ realm }) => {
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
