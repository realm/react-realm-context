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
import Realm from 'realm';

import { createRealmContext, RealmProvider as DefaultRealmProvider } from '.';

describe('realm-realm-context', () => {
  describe('createRealmContext', () => {
    afterEach(() => {
      // Delete the default file after the tests
      Realm.deleteFile({ path: Realm.defaultPath });
    });

    it('returns a RealmProvider and a RealmConsumer', () => {
      // Create a context
      const result = createRealmContext();
      // Assert something about it
      assert.equal(Object.keys(result).length, 6);
      const {
        RealmProvider,
        RealmConsumer,
        RealmInitializer,
        RealmQuery,
        RealmConnection,
        withRealm,
      } = result;
      assert(RealmProvider);
      assert(RealmConsumer);
      assert(RealmInitializer);
      assert(RealmQuery);
      assert(RealmConnection);
      assert(withRealm);
    });

    it('calls any function passed as the children prop', () => {
      const { RealmProvider } = createRealmContext();
      const tree = renderer.create(
        <RealmProvider>
          {props => {
            // Assert exactly 1 properties passed through props
            assert.equal(Object.keys(props).length, 1);
            // Assert that a Realm is passed as property
            assert(props.realm instanceof Realm);
            // Signal that the children prop callback was called
            return 'hi from render prop!';
          }}
        </RealmProvider>,
      );
      // Asserting the tree matches the string which was returned
      assert.equal(tree.toJSON(), 'hi from render prop!');
      tree.unmount();
    });

    it('does not re-render RealmProvider when Realm changes', async () => {
      // Create a context
      const { RealmProvider } = createRealmContext();
      let realm: Realm;
      let updatingRenderCount = 0;
      // Render it ..
      const tree = renderer.create(
        <RealmProvider
          schema={[{ name: 'Person', properties: { name: 'string' } }]}
        >
          {context => {
            realm = context.realm;
            updatingRenderCount++;
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
      assert.equal(updatingRenderCount, 1);
    });

    it('re-renders RealmProvider when Realm changes when asked to', async () => {
      // Create a context
      const { RealmProvider } = createRealmContext();
      let realm: Realm;
      let updatingRenderCount = 0;
      // Render it ..
      const tree = renderer.create(
        <RealmProvider
          schema={[{ name: 'Person', properties: { name: 'string' } }]}
          updateOnChange={true}
        >
          {context => {
            realm = context.realm;
            updatingRenderCount++;
            return realm
              .objects<{ name: string }>('Person')
              .map(p => p.name)
              .join(' & ');
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
      assert.equal(tree.toJSON(), 'Alice & Bob');
      tree.unmount();
      // Initially, creating Alice and creating Bob
      assert.equal(updatingRenderCount, 3);
    });

    it('renders the RealmConsumer when wrapped in RealmProvider', () => {
      // Create a context
      const { RealmProvider, RealmConsumer } = createRealmContext();
      // Render it ..
      const tree = renderer.create(
        <RealmProvider>
          <RealmConsumer>
            {props => {
              // Assert exactly 1 properties passed through props
              assert.equal(Object.keys(props).length, 1);
              // Assert that a Realm is passed as property
              assert(props.realm instanceof Realm);
              // Signal that the children prop callback was called
              return 'hi from context consumer!';
            }}
          </RealmConsumer>
        </RealmProvider>,
      );
      assert.equal(tree.toJSON(), 'hi from context consumer!');
      tree.unmount();
    });

    it('re-renders RealmConsumer when Realm changes only when asked to', async () => {
      // Create a context
      const { RealmProvider, RealmConsumer } = createRealmContext();
      let defaultRenderCount = 0;
      let updatingRenderCount = 0;
      // Render it ..
      const tree = renderer.create(
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

  describe('default RealmProvider & RealmConsumer', () => {
    afterEach(() => {
      // Delete the default file after the tests
      Realm.deleteFile({ path: Realm.defaultPath });
    });

    it('calls any function passed as the children prop', () => {
      const tree = renderer.create(
        <DefaultRealmProvider>
          {() => {
            return 'hi from render prop!';
          }}
        </DefaultRealmProvider>,
      );
      // Asserting the tree matches the string which was returned
      assert.equal(tree.toJSON(), 'hi from render prop!');
      tree.unmount();
    });
  });
});
