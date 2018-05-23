import React, { Component } from 'react';

import { CarRealmProvider } from './CarRealm';
import { PersonRealmProvider } from './PersonRealm';
import { SomeChildComponent } from './SomeChildComponent';

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
