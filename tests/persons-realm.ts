import * as Realm from 'realm';

export interface IPerson {
  name: string;
  age: number;
}

export const schema: Realm.ObjectSchema[] = [
  {
    name: 'Person',
    properties: {
      name: 'string',
      age: 'int',
    }
  }
];
