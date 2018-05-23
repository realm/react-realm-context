# React Realm Context

A more React'y experience of Realm:

- Opens and closes Realms with the component lifecycle.
- Provides a [React context](https://reactjs.org/docs/context.html) for child components to read from and write to the
  database.
- Adds and removes listeners on results with the component lifecycle which re-renders components when data change.

## Installation

Install using NPM (or yarn) - if you already have React and Realm (both are peer dependencies) installed

    npm install --save react-realm-context

or to install Realm and React while you're at it

    npm install --save react-realm-context realm react

**Note:** This package depends on Realm JS version 2.0.0 or above and React at version 16.3 or above, but to allow
maximum flexibility these are not direct dependencies but rather peer dependencies that needs to be installed for this
package to function correctly.

## Documentation

For now, this README.md, the `/examples` in this repository and the TypeScript types published with the package are the
best documentation available.

*// TODO: Add a static page showing off the TypeScript types and the usage of the individual components*

## Using it

```
// App.js

import React, { Component } from 'react';
import { RealmProvider, RealmConsumer } from 'react-realm-context';

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

---

## Initialize data

Its easy to initialize the database when its opened for the first time.
(using Realm.empty)

## Will update on any change until you specify what you're looking for

## Where not to use it

Don't use this in a "regular browser"

##
