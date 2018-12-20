<p align="center">
  <img height="140" src="https://github.com/realm/react-realm-context/raw/master/docs/logo.svg?sanitize=true" alt="React Realm Context"/>
</p>

<h1 align="center">
  React Realm Context
</h1>

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

Documentation generated from the TypeScript (tsdocs) comments of the latest published version is published on
https://realm.github.io/react-realm-context. In addition to this and the README.md, the
[/examples](https://github.com/realm/react-realm-context/tree/master/examples) directory and the TypeScript types
published with the package are the best documentation available.

## Using React Realm Context

### Importing the components

If you're only planing on opening a single Realm throughout your app, you should use the "default components" exported
by this package.

```javascript
import {
  RealmProvider,
  RealmConsumer,
  RealmConnection,
  RealmInitializer,
  RealmQuery,
  withRealm
} from 'react-realm-context';
```

<details>
<summary>Using React Realm Context with multiple Realms (click to expand)</summary>

If you're planning on opening multiple Realms within the same app, you should create a context (calling
`createRealmContext`) for every Realm that you plan on accessing.

It's a good pattern to wrap the creation of the context in its own module and export the newly created components from
that, renaming the components.

```javascript
// MyRealm.js

import { createRealmContext } from 'react-realm-context';
// Create the Realm context components
const {
  RealmProvider,
  RealmConsumer,
  RealmConnection,
  RealmInitializer,
  RealmQuery,
  withRealm
} = createRealmContext();
// Export the components renamed
export {
  RealmProvider as MyRealmProvider,
  RealmConsumer as MyRealmConsumer,
  RealmConnection as MyRealmConnection,
  RealmInitializer as MyRealmInitializer,
  RealmQuery as MyRealmQuery,
  withRealm as withMyRealm,
}
```

It's also a good pattern to define and export the schema used in the particular Realm from here, or even better, create
a functional component wrapping the newly created `RealmProvider` with the logic needed to open the Realm:

```javascript
// MyRealm.js

// Instead of "RealmProvider as MyRealmProvider".
// Create a MyRealmProvider component wrapping the newly created context provider.
const schema = [ /* Your Realm schema goes here ... */ ];
export const MyRealmProvider = ({ children }) => (
  <RealmProvider schema={schema}>
    {children}
  </RealmProvider>
);
```

If you're using TypeScript, the `MyRealm.ts` would be a great place to export the types used in the schema too.
</details>

### Using a RealmProvider and RealmConsumer

React Realm Context is built around two primitives known from the
[React context API](https://reactjs.org/docs/context.html), the provider and the consumer.

#### RealmProvider

This component opens and closes the Realm and it provides a Realm context to any consumer in its component sub-tree
(its children or their children, etc). The RealmProvider passes any props to the Realm JS constructor as configuration
when opening the Realm. See https://realm.io/docs/javascript/latest/api/Realm.html#~Configuration of the Realm JS
version used as peer dependency for a list of available props.

#### RealmConsumer

This component consumes the Realm provided by the provider and renders or modifies data from the Realm. It's using the
[render prop pattern](https://reactjs.org/docs/render-props.html#using-props-other-than-render) to expose the Realm.

It takes an optional prop to `updateOnChange` (default is `false`) which will register listeners and re-render the
component on any change to the Realm.

#### Example

```javascript
<RealmProvider schema={[{ name: 'Person', properties: { name: 'string' } }]}>
  <RealmConsumer updateOnChange={true}>
    {({ realm }) => realm.objects('Person').map(person => person.name).join(', ')}
  </RealmConsumer>
</RealmProvider>
```

See [/examples/simple-context](https://github.com/realm/react-realm-context/tree/master/examples/simple-context) for the
complete example app.

<details>
<summary>Example: Using the default RealmProvider and RealmConsumer in a simple app (click to expand)</summary>

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
</details>

### Using a RealmQuery and RealmInitializer

Some tasks are frequently performed with Realms (like populating the Realm with data or querying it for data), to
simplify these common tasks React Realm Context implements a few helper components.

#### RealmQuery

The `RealmQuery` component wraps the `RealmConsumer` to provide a simple interface for reading objects from the Realm.

It takes props for the `type` of objects to query for as well as optional props for `filter` and `sort` which should be
applied to the results. This component uses the
[render prop pattern](https://reactjs.org/docs/render-props.html#using-props-other-than-render) to expose the results as
an object with a `results` property passed to the callback function passed as `children` to the component.


```javascript
<RealmQuery type="Person" filter="age > 10" sort="name">
  {({ results }) => results.map(person => person.name).join(', ')}
</RealmQuery>
```

#### RealmInitializer

The `RealmInitializer` component wraps the `RealmConsumer` to provide a simple interface for creating objects if the
Realm is opened for the first time (and is therefore empty).

This component uses the
[render prop pattern](https://reactjs.org/docs/render-props.html#using-props-other-than-render) and calls the function
passed as `children` only if the Realm is empty. It calls the callback while in a write transaction.

```javascript
<RealmInitializer>
  {({ realm }) => {
    realm.create('Person', { name: 'Alice', age: 16 });
    realm.create('Person', { name: 'Bobby Boy', age: 37 });
    realm.create('Person', { name: 'Charlie', age: 72 });
  }}
</RealmInitializer>
```

#### Example

See [/examples/initializer-and-query](https://github.com/realm/react-realm-context/tree/master/examples/initializer-and-query)
for the complete example app.

<details>
<summary>Example: Using the default RealmProvider, RealmInitializer and RealmQuery in a simple app (click to expand)</summary>
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
named "John Doe" if no data exists and use the `RealmQuery` to render the persons names.
</details>

### Using a RealmConnection

If your app is using a Realm synchronized with the Realm Object Server, it might be nice to display the current state
of connectivity. For this you can use the `RealmConnection` component, which wraps the `RealmConsumer` and attach
listeners on the
[sync sessions connection state](https://realm.io/docs/javascript/latest/api/Realm.Sync.Session.html#connectionState)
It uses the [render prop pattern](https://reactjs.org/docs/render-props.html#using-props-other-than-render) and calls
the function passed as `children` initially and every time the connection state changes.

```javascript
<RealmConnection>
  {connectionState => `Connection state: ${connectionState}`}
</RealmConnection>
```

### Using a withRealm

If you just want to implement a component that uses the Realm it might be verbose to implement a component that renders
a `RealmConsumer` and passes the Realm instance to a different component which uses it.

In this scenario you might want to use the `withRealm`
[higher-order component](https://reactjs.org/docs/higher-order-components.html) to enhance your own component.

```javascript
// Defining a component that needs a `realm` Realm instance
const MyComponent = ({ greeting, realm }) => `${greeting}, realm is ${realm.isClosed ? 'closed' : 'open'}`;

// Enhance the component, which injects the `realm` prop when rendered
const MyEnhancedComponent = withRealm(MyComponent);

// Renders "Hi there, realm is open"
const App = () => (
  <RealmProvider>
    <MyEnhancedComponent greeting="Hi there" />
  </RealmProvider>
);
```

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
