import { createRealmContext } from 'react-realm-context';

const { RealmProvider, RealmConsumer } = createRealmContext();

const CarSchema = {
  name: 'Car',
  properties: {
    model: 'string',
    doors: 'number'
  }
};

const CarRealmProvider = () => (
  <RealmProvider path="cars.realm" schema={[ CarSchema ]} />
);

export {
  CarRealmProvider,
  RealmConsumer as CarRealmConsumer,
};
