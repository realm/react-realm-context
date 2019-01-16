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

import { IRealmQueryProps, RealmProvider, RealmQuery } from '.';

// This test doesn't document public methods and properties
// tslint:disable:completed-docs

describe('RealmQuery (swapped Realm)', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = null;
    }
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('will update when config props change', done => {
    let step = 0;
    let previousRealm: Realm;

    function finish(realm: Realm) {
      // Unmounting should close the Realm
      tree.unmount();
      tree = null;
      // Wait a tick before checking if the Realm closed ...
      process.nextTick(() => {
        assert.equal(realm.isClosed, true, 'the Realm was not closed');
        done();
      });
    }

    // Define an typed version of the RealmQuery component
    interface IPersonQueryProps extends IRealmQueryProps<IPerson> {
      type: 'Person';
    }
    const TypedRealmQuery = RealmQuery as React.ComponentType<
      IPersonQueryProps
    >;

    interface IWrappingComponentState {
      config: Realm.PartialConfiguration;
    }

    class WrappingComponent extends React.Component<
      {},
      IWrappingComponentState
    > {
      public state: IWrappingComponentState = { config: {} };

      public render() {
        return (
          <RealmProvider {...this.state.config} schema={schema}>
            <TypedRealmQuery type="Person">
              {({ realm, results }) => {
                if (step === 0) {
                  step++;
                  assert.equal(results.length, 0);
                  previousRealm = realm;
                  // Create a person
                  realm.write(() => {
                    realm.create<IPerson>('Person', {
                      name: 'John Doe',
                      age: 42,
                    });
                  });
                  // First the function is called when no persons exists
                } else if (step === 1) {
                  step++;
                  assert.equal(
                    previousRealm,
                    realm,
                    'Expected the Realm instance to be reused',
                  );
                  assert.equal(
                    realm.readOnly,
                    false,
                    'Expected Realm to be read-write',
                  );
                  assert.equal(results.length, 1);
                  assert.equal(results[0].name, 'John Doe');
                  // Reopen the Realm as read-only
                  this.setState({ config: { readOnly: true } });
                } else if (step === 2) {
                  step++;
                  assert.notEqual(
                    previousRealm,
                    realm,
                    'Expected the Realm to have changed',
                  );
                  assert.equal(
                    realm.readOnly,
                    true,
                    'Expected Realm to be read-only',
                  );
                  // We're expecting the results object to have changed, but contain elements with the same values
                  assert.equal(results[0].name, 'John Doe');
                  finish(realm);
                } else {
                  done(
                    new Error(
                      `RealmQuery rendered unexpectedly (step = ${step})`,
                    ),
                  );
                }
                return null;
              }}
            </TypedRealmQuery>
          </RealmProvider>
        );
      }
    }

    tree = renderer.create(<WrappingComponent />);
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), null);
  });
});
