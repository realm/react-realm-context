import * as Realm from 'realm';

/**
 * A person which has a name and an age.
 * It's used by the example Realms in tests.
 */
export interface IPerson {
  name: string;
  age: number;
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
    },
  },
];
