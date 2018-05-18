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

describe('Realm.js', () => {
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

  it('does not throw', (done) => {
    let step = 0;
    let alice: IPerson;

    const finish = () => {
      realm.close();
      // Wait a tick before checking if the Realm closed ...
      process.nextTick(() => {
        assert.equal(realm.isClosed, true, 'the Realm was not closed');
        done();
      });
    };

    // First we create a collection
    const results = realm.objects<IPerson>('Person').filtered('age > 30');
    assert.equal(results.length, 0);
    // Then we create a listener and register it on the collection
    const onChange: Realm.CollectionChangeCallback<IPerson> = (collection, change) => {
      if (step === 0) {
        assert(results.length === 0);
        // First the function is called when no persons exists
        step++;
      } else if (step === 2) {
        assert.equal(results.length, 1);
        // Close the Realm
        finish();
      } else {
        const err = new Error('RealmQuery rendered unexpectedly');
        done(err);
      }
    };
    // Start listening for changes
    results.addListener(onChange);
    // Create a single Person - asserting nothing happed
    assert.equal(step, 0);
    // Write a Person to the realm - delayed
    setTimeout(() => {
      // Transition step
      assert.equal(step, 1);
      step++;
      // Create a person
      realm.write(() => {
        realm.create<IPerson>('Person', {
          name: 'John Doe',
          age: 42,
        });
      });
    }, 10);
  });
});
