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

import { schema } from '../utils/persons-realm';

import { RealmConnection, RealmProvider } from '.';

describe('RealmConnection', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    // Delete the default file after the tests
    Realm.deleteFile({});
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
    // Unmounting should close the Realm
    tree.unmount();
    tree = null;
  });

  // Skipping this until we start a ROS server while running the tests
  it.skip('will be connecting for synced Realms', async () => {
    const states: string[] = [];
    const user = await Realm.Sync.User.login(
      'http://localhost:9080',
      Realm.Sync.Credentials.usernamePassword('realm-admin', ''),
      // Realm.Sync.Credentials.adminToken('faking-it'),
    );
    const config = user.createConfiguration({
      schema,
      sync: { fullSynchronization: true },
    });
    // Render with a sync configuration
    tree = renderer.create(
      <RealmProvider {...config}>
        <RealmConnection>
          {connectionState => {
            states.push(connectionState);
            return connectionState;
          }}
        </RealmConnection>
      </RealmProvider>,
    );

    // Wait for the client to connect
    await new Promise(resolve => setTimeout(resolve, 100));
    // Unmounting should close the Realm
    tree.unmount();
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), null);
    assert.deepEqual(states, ['disconnected', 'connecting', 'connected']);
    // Forget about the tree
    tree = null;
  });
});
