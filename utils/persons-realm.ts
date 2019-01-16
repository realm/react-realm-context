import * as Realm from 'realm';

/**
 * A person which has a name, an age and a list of dogs.
 * It's used by the example Realms in tests.
 */
export interface IPerson {
  name: string;
  age?: number;
  dogs: Realm.List<IDog>;
}

/**
 * A dog which has a name, an age.
 * It's used by the example Realms in tests.
 */
export interface IDog {
  name: string;
  age?: number;
}

/**
 * An example Realm schema which has just a Person object schema.
 * It's used by the example Realms in tests.
 */
export const schema: Realm.ObjectSchema[] = [
  {
    name: 'Person',
    properties: {
      name: 'string',
      age: 'int?',
      dogs: 'Dog[]',
    },
  },
  {
    name: 'Dog',
    properties: {
      name: 'string',
      age: 'int?',
    },
  },
];
