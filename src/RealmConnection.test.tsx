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

import { schema } from './test-utils/persons-realm';
import { withROS } from './test-utils/with-ros';

import { RealmConnection, RealmConsumer, RealmProvider } from '.';

describe('RealmConnection', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    // Delete the default file after the tests
    Realm.deleteFile({});
    // Unmounting should close the Realm
    if (tree) {
      tree.unmount();
      tree = null;
    }
  });

  it('will remain disconnected for local Realms', () => {
    const states: string[] = [];
    tree = renderer.create(
      <RealmProvider schema={schema}>
        <RealmConnection>
          {connectionState => {
            states.push(connectionState);
            return connectionState;
          }}
        </RealmConnection>
      </RealmProvider>,
    );

    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), 'disconnected');
    assert.deepEqual(states, ['disconnected']);
  });

  withROS.it('will be connecting for synced Realms', async function() {
    const states: string[] = [];
    const user = await this.ros.createTestUser();
    const config = user.createConfiguration({
      schema,
      sync: { fullSynchronization: true, url: '~/connection-test' },
    });

    let realm: Realm;

    // Wait for the connection state to be connected
    await new Promise(resolve => {
      // Render with a sync configuration
      tree = renderer.create(
        <RealmProvider {...config}>
          <RealmConsumer>
            {context => {
              realm = context.realm;
              return null;
            }}
          </RealmConsumer>
          <RealmConnection>
            {connectionState => {
              states.push(connectionState);
              if (connectionState === 'connected') {
                resolve();
              }
              return connectionState;
            }}
          </RealmConnection>
        </RealmProvider>,
      );
    });
    // Assert something about the states that changed so far
    assert.deepEqual(states, ['disconnected', 'connecting', 'connected']);
    // Create a promise that resolves when the state changes from connected to disconnected
    const disconnectedPromise = new Promise((resolve, reject) => {
      realm.syncSession.addConnectionNotification((newState, oldState) => {
        if (newState === 'disconnected' && oldState === 'connected') {
          resolve();
        } else {
          reject(`Unexpected state change, got ${newState} => ${oldState}`);
        }
      });
    });
    // Unmounting should close the Realm and disconnect
    tree.unmount();
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), null);
    // Forget about the tree
    tree = null;
    // Await a disconnection
    await disconnectedPromise;
  });
});
