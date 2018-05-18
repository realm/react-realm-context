import * as assert from 'assert';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { schema, IPerson } from '../tests/persons-realm';

import { RealmConsumer, RealmProvider, RealmQuery } from '.';

describe('RealmQuery (sort)', () => {

  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = undefined;
    }
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('will update, create objects and sort when changed', (done) => {
    let step = 0;
    let alice: IPerson;

    tree = renderer.create((
      <RealmProvider schema={schema}>
        <RealmQuery type="Person" sort="age">
          {({ realm, results }) => {
            if (step === 0) {
              step++;
              // First the function is called when no persons exists
              assert.equal(results.length, 0);
              // Create a person
              realm.write(() => {
                realm.create<IPerson>('Person', {
                  name: 'John Doe',
                  age: 42,
                });
              });
            } else if (step === 1) {
              step++;
              assert.equal(results.length, 1);
              // Create another person
              realm.write(() => {
                alice = realm.create<IPerson>('Person', {
                  name: 'Alice',
                  age: 40,
                });
              });
            } else if (step === 2) {
              step++;
              assert.equal(results.length, 2);
              // We expect Alice first and then John
              assert.equal(results[0].name, 'Alice');
              assert.equal(results[1].name, 'John Doe');
              // Create another person
              realm.write(() => {
                // Alice was older
                alice.age = 60;
              });
            } else if (step === 3) {
              step++;
              assert.equal(results.length, 2);
              // We expect John first and then Alice
              assert.equal(results[0].name, 'John Doe');
              assert.equal(results[1].name, 'Alice');
              // We're done!
              done();
            } else {
              done(new Error('RealmQuery rendered unexpectedly'));
            }
            return null;
          }}
        </RealmQuery>
      </RealmProvider>
    ));
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), null);
  });
});
