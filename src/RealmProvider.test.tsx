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

import { RealmProvider } from '.';

describe('RealmProvider', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = undefined;
    }
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('does not re-renders when Realm changes by default', async () => {
    let renderCount = 0;
    let realm: Realm;
    // Render it ..
    tree = renderer.create(
      <RealmProvider
        schema={[{ name: 'Person', properties: { name: 'string' } }]}
      >
        {context => {
          realm = context.realm;
          renderCount++;
          return realm.objects('Person').length;
        }}
      </RealmProvider>,
    );

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

    // Wait for component to re-render
    await new Promise(resolve => process.nextTick(resolve));
    assert.equal(tree.toJSON(), '0');
    tree.unmount();
    // Just once
    assert.equal(renderCount, 1);
  });

  it('re-renders when Realm changes when asked to', async () => {
    // Create a context
    let renderCount = 0;
    let realm: Realm;
    // Render it ..
    tree = renderer.create(
      <RealmProvider
        schema={[{ name: 'Person', properties: { name: 'string' } }]}
        updateOnChange={true}
      >
        {context => {
          if (realm) {
            assert.equal(
              realm,
              context.realm,
              'Expected Realm instance to be re-used',
            );
          } else {
            realm = context.realm;
          }
          renderCount++;
          return realm
            .objects<{ name: string }>('Person')
            .map(p => p.name)
            .join(' & ');
        }}
      </RealmProvider>,
    );

    process.nextTick(() => {
      assert.equal(tree.toJSON(), '');
      realm.write(() => {
        realm.create('Person', { name: 'Alice' });
      });
      // Update it again ...
      process.nextTick(() => {
        assert.equal(tree.toJSON(), 'Alice');
        realm.write(() => {
          realm.create('Person', { name: 'Bob' });
        });
      });
    });

    // Wait for component to re-render
    await new Promise(resolve => process.nextTick(resolve));
    assert.equal(tree.toJSON(), 'Alice & Bob');
    tree.unmount();
    // Initially, creating Alice and creating Bob
    assert.equal(renderCount, 3);
  });
});
