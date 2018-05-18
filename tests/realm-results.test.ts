import * as assert from 'assert';
import * as Realm from 'realm';

interface IPerson {
  name: string;
  age: number;
}

const schema: Realm.ObjectSchema[] = [
  {
    name: 'Person',
    properties: {
      name: 'string',
      age: 'int',
    }
  }
];

describe('Realm results', () => {
  let realm: Realm;

  before(() => {
    // Open a local realm
    assert(!realm);
    realm = new Realm({ path: 'test.realm', schema });
  });

  after(() => {
    if (realm) {
      if (!realm.isClosed) {
        realm.close();
      }
      Realm.deleteFile({ path: realm.path });
    }
  });

  it('fires listeners', (done) => {
    let step = 0;
    // First we create a collection
    const persons = realm.objects('Person');
    assert.equal(persons.length, 0);
    // Then we create a listener and register it on the collection
    const onChange: Realm.CollectionChangeCallback<IPerson> = (collection, change) => {
      if (step === 1) {
        const changeCount =
          change.deletions.length +
          change.insertions.length +
          change.modifications.length;
        if (changeCount === 0) {
          // TODO: Determine if this is expected behaviour
          // throw new Error('onChange was called with no changes');
        } else {
          assert.equal(collection.length, 1);
          assert.equal(persons.length, 1);
          done();
        }
      } else {
        // TODO: Determine if this is expected behaviour
        // throw new Error('onChange was called with no changes');
      }
    };
    persons.addListener(onChange);
    // Create a single Person - asserting nothing happed
    assert.equal(step, 0);
    if (step === 0) {
      step = 1;
      realm.write(() => {
        realm.create<IPerson>('Person', {
          name: 'John Doe',
          age: 42,
        });
      });
    } else {
      throw new Error('Expected step to be 0');
    }
  });
});
