import { createRealmContext } from 'react-realm-context';

const { RealmProvider, RealmConsumer } = createRealmContext();

const PersonSchema = {
  name: 'Person',
  properties: {
    name: 'string',
    age: 'number'
  }
};

const PersonRealmProvider = () => (
  <RealmProvider path="first.realm" schema={[ PersonSchema ]} />
);

export {
  PersonRealmProvider,
  RealmConsumer as PersonRealmConsumer,
};
