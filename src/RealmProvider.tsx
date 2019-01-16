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
    private realm: Realm;

    // TODO: Add propTypes for non-TypeScript users

    public constructor(props: IRealmProviderProps) {
      super(props);
      // Open the Realm
      const { children, ...config } = this.props;
      this.realm = new Realm(config);
      if (props.updateOnChange) {
        this.realm.addListener('change', this.onRealmChange);
        this.realm.addListener('schema', this.onRealmChange);
      }
    }

    public componentWillUnmount() {
      if (this.realm) {
        if (!this.realm.isClosed) {
          this.realm.removeListener('change', this.onRealmChange);
          this.realm.removeListener('schema', this.onRealmChange);
        }
        this.realm.close();
        delete this.realm;
      }
    }

    /**
     * Renders the component.
     */
    public render() {
      const { children } = this.props;
      const context = this.getContext();
      return (
        <WrappedProvider value={context}>
          {typeof children === 'function'
            ? (children as RealmRenderer)(context) /* Assume a RealmRenderer */
            : children}
        </WrappedProvider>
      );
    }

    private getContext(): IRealmContext {
      return { realm: this.realm };
    }

    private onRealmChange = () => {
      this.forceUpdate();
    };
  }

  return RealmProvider;
};
