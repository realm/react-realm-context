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

import { RealmConsumer, RealmProvider } from '.';

describe('RealmConsumer', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = undefined;
    }
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('re-renders when Realm changes only when asked to', async () => {
    // Create a context
    let defaultRenderCount = 0;
    let updatingRenderCount = 0;
    // Render it ..
    tree = renderer.create(
      <RealmProvider
        schema={[{ name: 'Person', properties: { name: 'string' } }]}
      >
        <RealmConsumer>
          {({ realm }) => {
            process.nextTick(() => {
              realm.write(() => {
                realm.create('Person', { name: 'Alice' });
              });
              // Update it again ...
              process.nextTick(() => {
                realm.write(() => {
                  realm.create('Person', { name: 'Bob' });
                });
              });
            });
            defaultRenderCount++;
            return null;
          }}
        </RealmConsumer>
        <RealmConsumer updateOnChange={true}>
          {({ realm }) => {
            updatingRenderCount++;
            return realm
              .objects<{ name: string }>('Person')
              .map(p => p.name)
              .join(' & ');
          }}
        </RealmConsumer>
      </RealmProvider>,
    );

    // Wait for component to re-render
    await new Promise(resolve => process.nextTick(resolve));
    assert.equal(tree.toJSON(), 'Alice & Bob');
    tree.unmount();

    assert.equal(defaultRenderCount, 1);
    // Initially, creating Alice and creating Bob
    assert.equal(updatingRenderCount, 3);
  });
});
