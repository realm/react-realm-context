////////////////////////////////////////////////////////////////////////////
//
// Copyright 2018 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

import equal from 'fast-deep-equal';
import memoizeOne from 'memoize-one';
import React from 'react';
import Realm from 'realm';

import { IRealmContext } from '.';

type RealmRenderer = (context: IRealmContext) => React.ReactChild;

/**
 * Props passed to a RealmProvider component.
 */
export interface IRealmProviderProps extends Realm.Configuration {
  children: React.ReactNode | RealmRenderer;
  updateOnChange?: boolean;
}

/**
 * Generates a RealmProvider wrapping a context provider.
 *
 * Use {@link createRealmContext} or the default RealmProvider instead of calling this directly.
 */
export const generateRealmProvider = (
  WrappedProvider: React.Provider<IRealmContext>,
): React.ComponentType<IRealmProviderProps> => {
  class RealmProvider extends React.Component<IRealmProviderProps> {
    private changeListenersAdded: boolean = false;
    private realm: Realm;
    private memoizedRealm = memoizeOne((config: Realm.Configuration) => {
      // Another Realm was already memoized, let's forget about it
      if (this.realm) {
        this.forgetRealm();
      }
      // Create a new Realm
      const realm = new Realm(config);
      // Store it so we can clean up later
      this.realm = realm;
      // Return the Realm
      return realm;
    }, equal);

    // TODO: Add propTypes for non-TypeScript users

    public componentWillUnmount() {
      if (this.realm) {
        this.forgetRealm();
      }
    }

    /**
     * Renders the component.
     */
    public render() {
      const { children, updateOnChange, ...config } = this.props;
      const realm = this.memoizedRealm(config);
      // Register the change listeners if asked to and they were not already there
      if (updateOnChange && !this.changeListenersAdded) {
        this.addChangeListeners(realm);
      }
      // Collect the context
      const context: IRealmContext = { realm };
      return (
        <WrappedProvider value={context}>
          {typeof children === 'function'
            ? (children as RealmRenderer)(context) // Assume a RealmRenderer
            : children}
        </WrappedProvider>
      );
    }

    private forgetRealm() {
      if (!this.realm.isClosed) {
        // Ensure we don't register change listeners anymore
        this.removeChangeListeners(this.realm);
        this.realm.close();
      }
      this.changeListenersAdded = false;
      delete this.realm;
    }

    private addChangeListeners(realm: Realm) {
      realm.addListener('change', this.onRealmChange);
      realm.addListener('schema', this.onRealmChange);
      this.changeListenersAdded = true;
    }

    private removeChangeListeners(realm: Realm) {
      realm.removeListener('change', this.onRealmChange);
      realm.removeListener('schema', this.onRealmChange);
      this.changeListenersAdded = false;
    }

    private onRealmChange = () => {
      this.forceUpdate();
    };
  }

  return RealmProvider;
};
