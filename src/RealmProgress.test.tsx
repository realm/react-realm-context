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

import {
  IRealmProgressValue,
  RealmConsumer,
  RealmInitializer,
  RealmProgress,
  RealmProvider,
} from '.';

describe('RealmProgress', () => {
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

  it('wont report progress for local Realms', () => {
    const states: IRealmProgressValue[] = [];
    let realm: Realm;
    tree = renderer.create(
      <RealmProvider schema={schema}>
        <RealmInitializer>
          {context => {
            realm = context.realm;
            realm.create('Person', { name: 'John' });
          }}
        </RealmInitializer>
        <RealmProgress>
          {progress => {
            states.push(progress);
            return JSON.stringify(progress.isLoading);
          }}
        </RealmProgress>
      </RealmProvider>,
    );

    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), 'false');
    // Assert something about the states
    assert.equal(states.length, 1);
    const firstProgress = states[0];
    assert.equal(firstProgress.isLoading, false);
    assert.equal(firstProgress.isDownloading, false);
    assert.equal(firstProgress.isUploading, false);
    // Assert that a person was indeed added
    assert.equal(realm.objects('Person').length, 1);
  });

  withROS.it('will be progressing for synced Realms', async function() {
    const states: IRealmProgressValue[] = [];
    const user = await this.ros.createTestUser();
    const config = user.createConfiguration({
      schema,
      sync: { fullSynchronization: true, url: '~/progress-test' },
    });

    // Let's first create a Realm that can be downloaded.
    const realm = new Realm(config);
    realm.write(() => {
      realm.create('Person', { name: 'Alice' });
    });
    await realm.syncSession.uploadAllLocalChanges();
    // Close and delete the Realm file to force redownloading it from the server.
    realm.close();
    Realm.deleteFile(config);

    // Wait for the connection state to be connected
    await new Promise(resolve => {
      // Render with a sync configuration
      tree = renderer.create(
        <RealmProvider {...config}>
          <RealmProgress>
            {progress => {
              states.push(progress);
              // console.log(progress);
              if (states.length === 1) {
                // Create an object to uploads
                progress.realm.write(() => {
                  progress.realm.create('Person', { name: 'Bob' });
                });
              } else if ('upload' in progress && !progress.isLoading) {
                // Assert that persons were indeed added
                assert.equal(progress.realm.objects('Person').length, 2);
                // Resolve when we're done uploading
                resolve();
              }
              return JSON.stringify(progress.isLoading);
            }}
          </RealmProgress>
        </RealmProvider>,
      );
    });
    // Assert something about the states that changed so far
    assert(states.length > 0, 'Expected at least one progress state');
    // Assert that the first and last states are not loading
    const firstProgress = states[0];
    const lastProgress = states[states.length - 1];
    assert.equal(firstProgress.isLoading, false);
    assert.equal(firstProgress.isDownloading, false);
    assert.equal(firstProgress.isUploading, false);
    assert.equal(lastProgress.isLoading, false);
    assert.equal(lastProgress.isDownloading, false);
    assert.equal(lastProgress.isUploading, false);
    // Assert that something was downloaded and uploaded
    const { download, upload } = lastProgress;
    assert(
      download && download.transferred > 0,
      'Expected something was downloaded',
    );
    assert(upload && upload.transferred > 0, 'Expected something was uploaded');
  });
});
