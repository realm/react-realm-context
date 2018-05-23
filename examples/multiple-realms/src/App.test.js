import assert from 'assert';
import React from 'react';
import ReactDOM from 'react-dom';
import Realm from 'realm';

import App from './App';

afterAll(() => {
  Realm.deleteFile({ path: 'cars.realm' });
  Realm.deleteFile({ path: 'persons.realm' });
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  assert.equal(div.innerHTML, 'true true');
  ReactDOM.unmountComponentAtNode(div);
});
