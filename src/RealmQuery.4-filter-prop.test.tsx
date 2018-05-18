import * as assert from 'assert';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { schema, IPerson } from '../tests/persons-realm';

import { RealmConsumer, RealmProvider, RealmQuery } from '.';

describe('RealmQuery (filter prop)', () => {

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
      threashold: number;
    }

    class PersonList extends React.Component<{}, IPersonListProps> {
      state: IPersonListProps = { threashold: 30 };

      render() {
        return (
          <RealmProvider schema={schema}>
            <RealmQuery
              type="Person"
              filter={['age > $0', this.state.threashold]}
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
                      age: 40,
                    });
                  });
                } else if (step === 1) {
                  step++;
                  assert.equal(results.length, 2);
                  // Change the filter to cut out Alice
                  process.nextTick(() => {
                    this.setState({ threashold: 41 });
                  });
                } else if (step === 2) {
                  step++;
                  // We expect that Alice is no longer in the results
                  assert.equal(results.length, 1);
                  // But John should still be there
                  const person = results[0];
                  assert.equal(person.name, 'John Doe');
                  assert.equal(person.age, 42);
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
