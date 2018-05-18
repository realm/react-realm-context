# Realm Context for React

More React'y API for realm.js, handling opening and closing the Realm and providing a
context for child components to read from and write to the database.

## Works as a context provider or render-prop component

It will check the type of the children passed as prop and either render
it normally or pass the context render-prop style.

## How it's used

```
// App.js

import React, { Component } from 'react';
import { createRealmContext } from 'react-realm-context';

const { RealmProvider } = createRealmContext();

import { PersonList } from './PersonList';

export class App from Component {
  render() {
    return (
      <RealmProvider>
        <PersonList />
      </RealmProvider>
    );
  }
}
```

```
// PersonList.js

import React, { Component } from 'react';
import { RealmContext } from 'react-realm-context';

export const PersonList = () => {

};

```

## Working with more than a single Realm

```
// MyRealm.js

import { createRealmContext } from 'react-realm-context';

const { RealmProvider, RealmConsumer } = createRealmContext();

export {
  RealmProvider as MyRealmProvider,
  RealmConsumer as MyRealmConsumer
};
```

```
// App.js

import React, { Component } from 'react';

import { MyRealmProvider } from './MyRealm';
import { PersonList } from './PersonList';

export class App from Component {
  render() {
    return (
      <MyRealmProvider>
        <PersonList />
      </MyRealmProvider>
    );
  }
}
```

```
// PersonList.js

import React, { Component } from 'react';

import { MyRealmConsumer } from './MyRealm';
import { PersonList } from './PersonList';

export const PersonList = () => (
  <MyRealmConsumer>
    {({ objects } => (

    ))}
  </MyRealmConsumer>
}
```

## Initialize data

Its easy to initialize the database when its opened for the first time.
(using Realm.empty)

## Will update on any change until you specify what you're looking for
