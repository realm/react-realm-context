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

import { IPerson, schema } from './test-utils/persons-realm';

import { RealmProvider, RealmQuery, RealmSorting } from '.';

// This test doesn't document public methods and properties
// tslint:disable:completed-docs

describe('RealmQuery (sort prop)', () => {
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

    interface IPersonListState {
      sort: RealmSorting;
    }

    class PersonList extends React.Component<{}, IPersonListState> {
      public state: IPersonListState = { sort: 'name' };

      public render() {
        return (
          <RealmProvider schema={schema}>
            <RealmQuery type="Person" sort={this.state.sort}>
              {({ realm, results }) => {
                if (step === 0) {
                  step++;
                  // First the function is called when no persons exists
                  assert.equal(results.length, 0);
                  // Create a person
                  realm.write(() => {
                    // John Doe
                    realm.create<IPerson>('Person', {
                      name: 'John Doe',
                      age: 42,
                    });
                    // Alice
                    realm.create<IPerson>('Person', {
                      name: 'Alice',
                      age: 50,
                    });
                  });
                } else if (step === 1) {
                  step++;
                  assert.equal(results.length, 2);
                  // We expect Alice first and then John
                  assert.equal(results[0].name, 'Alice');
                  assert.equal(results[1].name, 'John Doe');
                  // Create another person
                  this.setState({ sort: 'age' });
                } else if (step === 2) {
                  step++;
                  assert.equal(results.length, 2);
                  // We expect John first and then Alice
                  assert.equal(results[0].name, 'John Doe');
                  assert.equal(results[1].name, 'Alice');
                  // Reverse the sorting
                  this.setState({ sort: ['age', true] });
                } else if (step === 3) {
                  step++;
                  assert.equal(results.length, 2);
                  // We expect Alice first and then John
                  assert.equal(results[0].name, 'Alice');
                  assert.equal(results[1].name, 'John Doe');
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

    tree = renderer.create(<PersonList />);
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), null);
  });
});
