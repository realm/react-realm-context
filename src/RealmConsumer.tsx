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

import * as React from 'react';

import { IRealmContext } from '.';

type ConsumerChild = (context: IRealmContext) => React.ReactNode;

/**
 * Props passed to a RealmConsumer component.
 */
export interface IRealmConsumerProps {
  children: ConsumerChild;
  updateOnChange?: boolean;
}

/**
 * Generates a RealmConsumer wrapping a context consumer.
 * Use `createContext` instead of using this directly.
 */
export const generateRealmConsumer = (
  WrappedConsumer: React.Consumer<IRealmContext>,
): React.ComponentType<IRealmConsumerProps> => {
  class RealmConsumer extends React.Component<IRealmConsumerProps> {
    // TODO: Add propTypes for non-TypeScript users

    private realm: Realm;

    public componentWillUnmount() {
      this.forgetRealm();
    }

    /**
     * Renders the component.
     */
    public render() {
      return <WrappedConsumer>{this.renderContext}</WrappedConsumer>;
    }

    private renderContext = (context: IRealmContext | null) => {
      const { updateOnChange } = this.props;
      // Register a listener when the Realm passed throught the context changes
      if (context !== null && this.realm !== context.realm && updateOnChange) {
        // Remove the listener from any Realm to which it was already added
        this.forgetRealm();
        this.realm = context.realm;
        this.realm.addListener('change', this.onRealmChange);
        this.realm.addListener('schema', this.onRealmChange);
      }
      // Calling the function passed as children with the context
      return this.props.children(context);
    };

    private forgetRealm() {
      if (this.realm && !this.realm.isClosed) {
        this.realm.removeListener('change', this.onRealmChange);
        this.realm.removeListener('schema', this.onRealmChange);
      }
      delete this.realm;
    }

    private onRealmChange = () => {
      this.forceUpdate();
    };
  }

  return RealmConsumer;
};
