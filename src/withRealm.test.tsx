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

import { IPerson, schema } from '../utils/persons-realm';

import { RealmConsumer, RealmInitializer, RealmProvider, withRealm } from '.';

// This test creates more than one class and doesn't document their public methods.
// tslint:disable:max-classes-per-file
// tslint:disable:completed-docs

describe('withRealm injector', () => {
  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('will inject the default `realm` prop', () => {
    let realmReference: Realm;

    interface ISomeComponentProps {
      realm: Realm;
      greeting: string;
    }

    // tslint:disable-next-line:complete-docs
    class SomeComponent extends React.Component<ISomeComponentProps> {
      public render() {
        const names = this.props.realm
          .objects<{ name: 'string' }>('Person')
          .map(p => p.name)
          .join(', ');
        return `${this.props.greeting} ${names}`;
      }
    }

    const SomeEnhancedComponent = withRealm(SomeComponent);

    tree = renderer.create(
      <RealmProvider schema={schema}>
        <RealmInitializer>
          {({ realm }) => {
            realmReference = realm;
            realm.create('Person', { name: 'Bobby Boy' });
          }}
        </RealmInitializer>
        <SomeEnhancedComponent greeting="Hi there" />
      </RealmProvider>,
    );

    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), 'Hi there Bobby Boy');
    // Unmounting should close the Realm
    tree.unmount();
    tree = null;
    // Check that unmounting did indeed close the Realm
    assert.equal(realmReference.isClosed, true, 'the Realm was not closed');
  });

  it('will inject a named `myRealm` prop', () => {
    let realmReference: Realm;

    interface ISomeComponentProps {
      myRealm: Realm;
      greeting: string;
    }

    class SomeComponent extends React.Component<ISomeComponentProps> {
      public render() {
        const names = this.props.myRealm
          .objects<{ name: 'string' }>('Person')
          .map(p => p.name)
          .join(', ');
        return `${this.props.greeting} ${names}`;
      }
    }

    const SomeEnhancedComponent = withRealm(SomeComponent, 'myRealm');

    tree = renderer.create(
      <RealmProvider schema={schema}>
        <RealmInitializer>
          {({ realm }) => {
            realmReference = realm;
            realm.create('Person', { name: 'Bobby Boy' });
          }}
        </RealmInitializer>
        <SomeEnhancedComponent greeting="Hi there" />
      </RealmProvider>,
    );

    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), 'Hi there Bobby Boy');
    // Unmounting should close the Realm
    tree.unmount();
    tree = null;
    // Check that unmounting did indeed close the Realm
    assert.equal(realmReference.isClosed, true, 'the Realm was not closed');
  });

  it('will pass on props given when calling withRealm', async () => {
    let realmReference: Realm;

    let defaultRenderCount = 0;
    let updatingRenderCount = 0;

    class SomeComponent extends React.Component<{
      children?: React.ReactNode;
      realm: Realm;
    }> {
      public render() {
        const { realm } = this.props;
        realmReference = realm;
        updatingRenderCount++;
        return realm
          .objects<{ name: string }>('Person')
          .map(p => p.name)
          .join(' & ');
      }
    }

    const SomeEnhancedComponent = withRealm(SomeComponent, 'realm', {
      updateOnChange: true,
    });

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
        <SomeEnhancedComponent />
      </RealmProvider>,
    );

    // Wait for component to re-render
    await new Promise(resolve => process.nextTick(resolve));

    assert.equal(tree.toJSON(), 'Alice & Bob');
    tree.unmount();
    tree = null;

    assert.equal(defaultRenderCount, 1);
    // Initially, creating Alice and creating Bob
    assert.equal(updatingRenderCount, 3);
    // Check that unmounting did indeed close the Realm
    assert.equal(realmReference.isClosed, true, 'the Realm was not closed');
  });
});
