import * as assert from 'assert';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { schema, IPerson } from '../utils/persons-realm';

import { RealmConsumer, RealmProvider, RealmQuery, RealmSorting } from '.';

describe('RealmQuery (sort prop)', () => {

  let tree: renderer.ReactTestRenderer;

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = undefined;
    }
    // Delete the default file after the tests
    Realm.deleteFile({});
  });

  it('will update when filter prop change', (done) => {
    let step = 0;

    interface IPersonListProps {
      sort: RealmSorting;
    }

    class PersonList extends React.Component<{}, IPersonListProps> {
      state: IPersonListProps = { sort: 'name' };

      render() {
        return (
          <RealmProvider
            schema={schema}
          >
            <RealmQuery
              type="Person"
              sort={this.state.sort}
            >
              {({ realm, results }) => {
                if (step === 0) {
                  step++;
                  // First the function is called when no persons exists
                  assert.equal(results.length, 0);
                  // Create a person
                  realm.write(() => {
                    // John Doe
                    realm.create<IPerson>('Person', {
                      name: 'John Doe',
                      age: 42,
                    });
                    // Alice
                    realm.create<IPerson>('Person', {
                      name: 'Alice',
                      age: 50,
                    });
                  });
                } else if (step === 1) {
                  step++;
                  assert.equal(results.length, 2);
                  // We expect Alice first and then John
                  assert.equal(results[0].name, 'Alice');
                  assert.equal(results[1].name, 'John Doe');
                  // Create another person
                  this.setState({ sort: 'age' });
                } else if (step === 2) {
                  step++;
                  assert.equal(results.length, 2);
                  // We expect John first and then Alice
                  assert.equal(results[0].name, 'John Doe');
                  assert.equal(results[1].name, 'Alice');
                  // Reverse the sorting
                  this.setState({ sort: ['age', true] });
                } else if (step === 3) {
                  step++;
                  assert.equal(results.length, 2);
                  // We expect Alice first and then John
                  assert.equal(results[0].name, 'Alice');
                  assert.equal(results[1].name, 'John Doe');
                  // We're done!
                  done();
                } else {
                  done(new Error(`RealmQuery rendered unexpectedly (step = ${step})`));
                }
                return null;
              }}
            </RealmQuery>
          </RealmProvider>
        );
      }
    }

    tree = renderer.create((<PersonList />));
    // Asserting the tree matches the string which was returned
    assert.equal(tree.toJSON(), null);
  });
});
