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

import { IDog, IPerson, schema } from './test-utils/persons-realm';

import { RealmProvider, RealmQuery } from '.';

// This test doesn't document public methods and properties
// tslint:disable:completed-docs

describe('RealmQuery (type prop)', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = null;
    }
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('will update when prop change', done => {
    let step = 0;

    interface IListState {
      type: 'Person' | 'Dog';
    }

    class List extends React.Component<{}, IListState> {
      public state: IListState = { type: 'Person' };

      public render() {
        return (
          <RealmProvider schema={schema}>
            <RealmQuery type={this.state.type}>
              {({ realm, results }) => {
                if (step === 0) {
                  step++;
                  // First the function is called when no persons exists
                  assert.equal(results.length, 0);
                  // Create a person
                  realm.write(() => {
                    // The person Alice
                    const alice = realm.create<IPerson>('Person', {
                      name: 'Alice',
                    });
                    // The person Bob
                    realm.create<IPerson>('Person', { name: 'Bob' });
                    // The dog Charlie
                    const charlie = realm.create<IDog>('Dog', {
                      name: 'Charlie',
                    });
                    // Which belongs to Alice
                    alice.dogs.push(charlie);
                  });
                } else if (step === 1) {
                  step++;
                  assert.equal(results.length, 2);
                  // We expect Alice first and then John
                  assert.equal(results[0].name, 'Alice');
                  assert.equal(results[1].name, 'Bob');
                  // Change the query to return Dogs
                  this.setState({ type: 'Dog' });
                } else if (step === 2) {
                  step++;
                  assert.equal(results.length, 1);
                  // We expect Alice's dog charlie
                  assert.equal(results[0].name, 'Charlie');
                  // We're done!
                  done();
                } else {
                  done(
                    new Error(
                      `RealmQuery rendered unexpectedly (step = ${step})`,
                    ),
                  );
                }
                return null;
              }}
            </RealmQuery>
          </RealmProvider>
        );
      }
    }

    tree = renderer.create(<List />);
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), null);
  });
});
