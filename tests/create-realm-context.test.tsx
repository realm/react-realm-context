import * as assert from 'assert';
import * as util from 'util';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { createRealmContext } from '../src';

describe('createRealmContext', () => {
  it('returns a RealmProvider and a RealmConsumer', () => {
    // Create a context
    const result = createRealmContext();
    // Assert something about it
    assert.equal(Object.keys(result).length, 2);
    const { RealmProvider, RealmConsumer } = result;
    assert(RealmProvider);
    assert(RealmConsumer);
  });

  it('renders the RealmConsumer when wrapped in RealmProvider', () => {
    // Create a context
    const { RealmProvider, RealmConsumer } = createRealmContext();
    // Render it ..
    const tree = renderer.create((
      <RealmProvider path="test.realm">
        <RealmConsumer>
          {({ realm }) => `hello!`}
        </RealmConsumer>
      </RealmProvider>
    ));
    assert.equal(tree.toJSON(), 'hello!');
  });
});
