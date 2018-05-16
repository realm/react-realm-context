import React, { Component } from 'react';

import { PersonRealmProvider } from './PersonRealm';
import { CarRealmProvider } from './CarRealm';

class App extends Component {
  render() {
    return (
      <PersonRealmProvider>
        <CarRealmProvider>
          <SomeChildComponent />
        </CarRealmProvider>
      </PersonRealmProvider>
    );
  }
}

export default App;
