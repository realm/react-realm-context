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

import { RealmConsumer, RealmProvider, RealmQuery } from '.';

describe('RealmQuery (basic)', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('will pass results as prop', done => {
    tree = renderer.create(
      <RealmProvider schema={schema}>
        <RealmQuery type="Person">
          {({ results }) => {
            assert(results);
            assert.equal(results.length, 0);
            return 'hi from render prop!';
          }}
        </RealmQuery>
      </RealmProvider>,
    );
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), 'hi from render prop!');
    tree.unmount();
    done();
  });

  it('will work with a Consumer', done => {
    let step = 0;

    const finish = (realm: Realm) => {
      // Unmounting should close the Realm
      tree.unmount();
      tree = null;
      // Wait a tick before checking if the Realm closed ...
      process.nextTick(() => {
        assert.equal(realm.isClosed, true, 'the Realm was not closed');
        done();
      });
    };

    tree = renderer.create(
      <RealmProvider schema={schema}>
        <RealmConsumer>
          {({ realm }) => {
            // Write a Person to the realm - delayed
            process.nextTick(() => {
              // Transition step
              assert.equal(step, 1);
              step++;
              // Create a person
              realm.write(() => {
                realm.create<IPerson>('Person', {
                  name: 'John Doe',
                  age: 42,
                });
              });
            });
            // But return right away ...
            return null;
          }}
        </RealmConsumer>
        <RealmQuery type="Person">
          {({ realm, results }) => {
            if (step === 0) {
              step++;
              assert.equal(results.length, 0);
              // First the function is called when no persons exists
            } else if (step === 2) {
              step++;
              assert.equal(results.length, 1);
              finish(realm);
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
