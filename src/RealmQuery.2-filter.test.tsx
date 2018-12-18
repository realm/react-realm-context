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

import * as assert from 'assert';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { IPerson, schema } from '../utils/persons-realm';

import { RealmProvider, RealmQuery } from '.';

describe('RealmQuery (filter)', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = undefined;
    }
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('will update, create objects and filter out when changed', done => {
    let step = 0;
    let alice: IPerson;

    tree = renderer.create(
      <RealmProvider schema={schema}>
        <RealmQuery type="Person" filter="age > 30">
          {({ realm, results }) => {
            if (step === 0) {
              step++;
              // First the function is called when no persons exists
              assert.equal(results.length, 0);
              // Create a person
              realm.write(() => {
                realm.create<IPerson>('Person', {
                  name: 'John Doe',
                  age: 42,
                });
              });
            } else if (step === 1) {
              step++;
              assert.equal(results.length, 1);
              // Create another person
              realm.write(() => {
                alice = realm.create<IPerson>('Person', {
                  name: 'Alice',
                  age: 40,
                });
              });
            } else if (step === 2) {
              step++;
              assert.equal(results.length, 2);
              // Create another person
              realm.write(() => {
                // Alice was younger
                alice.age = 20;
              });
            } else if (step === 3) {
              step++;
              // We expect that Alice is no longer in the results
              assert.equal(results.length, 1);
              // But John should still be there
              const person = results[0];
              assert.equal(person.name, 'John Doe');
              assert.equal(person.age, 42);
              // We're done!
              done();
            } else {
              done(
                new Error(`RealmQuery rendered unexpectedly (step = ${step})`),
              );
            }
            return null;
          }}
        </RealmQuery>
      </RealmProvider>,
    );
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), null);
  });
});
