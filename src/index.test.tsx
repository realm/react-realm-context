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
import * as Realm from 'realm';
import * as util from 'util';

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
      assert.equal(Object.keys(result).length, 4);
      const {
        RealmProvider,
        RealmConsumer,
        RealmInitializer,
        RealmQuery,
      } = result;
      assert(RealmProvider);
      assert(RealmConsumer);
      assert(RealmInitializer);
      assert(RealmQuery);
    });

    it('calls any function passed as the children prop', () => {
      const { RealmProvider, RealmConsumer } = createRealmContext();
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
  });

  describe('default RealmProvider & RealmConsumer', () => {
    afterEach(() => {
      // Delete the default file after the tests
      Realm.deleteFile({ path: Realm.defaultPath });
    });

    it('calls any function passed as the children prop', () => {
      let called = false;
      const tree = renderer.create(
        <DefaultRealmProvider>
          {() => {
            called = true;
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
