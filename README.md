# React Realm Context

A more React'y experience of Realm:

- Opens and closes Realms with the component lifecycle.
- Provides a [React context](https://reactjs.org/docs/context.html) for child components to read from and write to the
  database.
- Adds and removes listeners on results with the component lifecycle which re-renders components when data change.

**Please note:** This package uses Realm JS and it therefore has the same limitation that it needs access to the device
file system and therefore cannot run in a "regular" web-browser. This package is meant to be used in an environment like
Node.js, React Native or Electron where the JavaScript thread has access to the file system.

## Installation

Install using NPM (or yarn) - if you already have React and Realm (both are peer dependencies) installed

    npm install --save react-realm-context

or to install Realm and React while you're at it

    npm install --save react-realm-context realm react

**Note:** This package depends on Realm JS version 2.1.0 or above and React at version 16.3 or above, but to allow
maximum flexibility these are not direct dependencies but rather peer dependencies that needs to be installed for this
package to function correctly.

## Documentation

For now, this README.md, the `/examples` in this repository and the TypeScript types published with the package are the
best documentation available.

*// TODO: Add a static page showing off the TypeScript types and the usage of the individual components*

<details>
<summary>Components</summary>

The RealmProvider handles opening and closing a Realm and provides it as a context for other components in its subtree.

```javascript
import { RealmProvider } from 'react-realm-context';

const schema = [
  { name: 'Person', properties: { name: 'string' } }
];

export const App = () => (
  <RealmProvider schema={schema}>
    {/* The rest of your app goes here ... */}
  </RealmProvider>
)
```

</details>

## Using it

### Default local Realm via the default context with [render-prop](https://reactjs.org/docs/render-props.html)

```javascript
import React, { Component } from 'react';
import { RealmProvider } from 'react-realm-context';

export const App = () => (
  <RealmProvider schema={[{ name: 'Person', properties: { name: 'string' } }]}>
    {({ realm }) => {
      if (realm.empty) {
        realm.write(() => {
          realm.create('Person', { name: 'John Doe' });
        });
      }
      return realm.objects('Person').map(person => person.name).join(', ');
    }}
  </RealmProvider>
);

```

This will open the default local Realm using the default `RealmProvider` exported by the package.

See `/examples/simple-render-props` for a complete example.

### Default local Realm via the default context

```javascript
import React, { Component } from 'react';
import { RealmProvider } from 'react-realm-context';

import { SomeDeeplyNestedComponent } from './SomeDeeplyNestedComponent';

export const App = () => (
  <RealmProvider schema={[{ name: 'Person', properties: { name: 'string' } }]}>
    <SomeDeeplyNestedComponent />
  </RealmProvider>
);
```

```javascript
// SomeDeeplyNestedComponent.js

import React, { Component } from 'react';
import { RealmConsumer } from 'react-realm-context';

export const SomeDeeplyNestedComponent = () => (
  <RealmConsumer>
    {({ realm }) => {
      if (realm.empty) {
        realm.write(() => {
          realm.create('Person', { name: 'John Doe' });
        });
      }
      return realm.objects('Person').map(person => person.name).join(', ');
    }}
  </RealmConsumer>
);
```

This will open the default local Realm using the default `RealmProvider` exported by the package and pass the open Realm
to any (potentially deeply nested) `RealmConsumer`s in its component sub-tree.

See `/examples/simple-context` for a complete example.

### Default local Realm via the default context, RealmInitializer and RealmQuery

Initializing data if the Realm is empty and querying for data are common patterns that the package has components for:
- Use the `RealmInitializer` to create objects if the Realm is empty.
- Use the `RealmQuery` to query for objects somewhere in a `RealmProvider` sub-tree.

```javascript
import React, { Component } from 'react';
import { RealmProvider } from 'react-realm-context';

import { SomeDeeplyNestedComponent } from './SomeDeeplyNestedComponent';

export const App = () => (
  <RealmProvider schema={[{ name: 'Person', properties: { name: 'string' } }]}>
    <RealmInitializer>
      {({ realm }) => {
        realm.create('Person', { name: 'John Doe' });
      }}
    </RealmInitializer>
    <SomeDeeplyNestedComponent />
  </RealmProvider>
);
```

```javascript
// SomeDeeplyNestedComponent.js

import React, { Component } from 'react';
import { RealmQuery } from 'react-realm-context';

export const SomeDeeplyNestedComponent = () => (
  <RealmQuery type="Person">
    {({ results }) => results.map(person => person.name).join(', ')}
  </RealmQuery>
);
```

This will open the default local Realm using the default `RealmProvider`, use the `RealmInitializer` to create a person
named "John Doe" if no data exists when opening the Realm and use the `RealmQuery` to render the persons names.

See `/examples/initializer-and-query` for a complete example.

## Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](https://realm.io/conduct/).
By participating, you are expected to uphold this code. Please report unacceptable behavior to [info@realm.io](mailto:info+conduct@realm.io).

## License

Realm React Context is published under the Apache 2.0 license.

**This product is not being made available to any person located in Cuba, Iran,
North Korea, Sudan, Syria or the Crimea region, or to any other person that is
not eligible to receive the product under U.S. law.**

## Feedback

**_If you use Realm and are happy with it, all we ask is that you please consider sending out a tweet mentioning [@realm](https://twitter.com/realm) to share your thoughts_**

**_And if you don't like it, please let us know what you would like improved, so we can fix it!_**

![analytics](https://ga-beacon.appspot.com/UA-50247013-2/react-realm-context/README?pixel)
