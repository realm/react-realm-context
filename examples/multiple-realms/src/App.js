import React, { Component } from 'react';

import { CarsRealmProvider } from './CarsRealm';
import { PersonsRealmProvider } from './PersonsRealm';
import { SomeChildComponent } from './SomeChildComponent';

class App extends Component {
  render() {
    return (
      <PersonsRealmProvider>
        <CarsRealmProvider>
          <SomeChildComponent />
        </CarsRealmProvider>
      </PersonsRealmProvider>
    );
  }
}

export default App;
