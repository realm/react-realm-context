import * as assert from 'assert';
import * as util from 'util';
import * as React from 'react';
import * as Realm from 'realm';
import * as renderer from 'react-test-renderer';

import { createRealmContext, RealmProvider, RealmConsumer } from '.';

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
      assert.equal(Object.keys(result).length, 3);
      const { RealmProvider, RealmConsumer, RealmQuery } = result;
      assert(RealmProvider);
      assert(RealmConsumer);
      assert(RealmQuery);
    });

    it('calls any function passed as the children prop', () => {
      const { RealmProvider, RealmConsumer } = createRealmContext();
      const tree = renderer.create((
        <RealmProvider>
          {(props) => {
            // Assert exactly 1 properties passed through props
            assert.equal(Object.keys(props).length, 1);
            // Assert that a Realm is passed as property
            assert(props.realm instanceof Realm);
            // Signal that the children prop callback was called
            return 'hi from render prop!';
          }}
        </RealmProvider>
      ));
      // Asserting the tree matches the string which was returned
      assert.equal(tree.toJSON(), 'hi from render prop!');
      tree.unmount();
    });

    it('renders the RealmConsumer when wrapped in RealmProvider', () => {
      // Create a context
      const { RealmProvider, RealmConsumer } = createRealmContext();
      // Render it ..
      const tree = renderer.create((
        <RealmProvider>
          <RealmConsumer>
            {(props) => {
              // Assert exactly 1 properties passed through props
              assert.equal(Object.keys(props).length, 1);
              // Assert that a Realm is passed as property
              assert(props.realm instanceof Realm);
              // Signal that the children prop callback was called
              return 'hi from context consumer!';
            }}
          </RealmConsumer>
        </RealmProvider>
      ));
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
      const tree = renderer.create((
        <RealmProvider>
          {() => { called = true; return 'hi from render prop!'; }}
        </RealmProvider>
      ));
      // Asserting the tree matches the string which was returned
      assert.equal(tree.toJSON(), 'hi from render prop!');
      tree.unmount();
    });
  });
});
