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

interface IRealmConnectionState {
  connectionState: Realm.Sync.ConnectionState;
}

/**
 * Props passed to a RealmConnection component.
 */
export interface IRealmConnectionProps {
  children: (connectionState: Realm.Sync.ConnectionState) => React.ReactChild;
}

/**
 * Generates a RealmConnection wrapping a context consumer.
 *
 * Use {@link createRealmContext} or the default RealmConnection instead of calling this directly.
 */
export const generateRealmConnection = (
  WrappedConsumer: React.Consumer<IRealmContext>,
): React.ComponentType<IRealmConnectionProps> => {
  /**
   * Adds a listener to the connection state (using `syncSession.addConnectionNotification`) and renders the function
   * passed as children, like a [render prop](https://reactjs.org/docs/render-props.html#using-props-other-than-render).
   */
  class RealmConnection extends React.Component<
    IRealmConnectionProps,
    IRealmConnectionState
  > {
    /**
     * The state stores the latest known state of connection, defaults to disconnected.
     */
    public state: IRealmConnectionState = {
      connectionState: Realm.Sync.ConnectionState.Disconnected,
    };

    private realm: Realm;

    /**
     * Renders the component.
     */
    public render() {
      return <WrappedConsumer>{this.renderContext}</WrappedConsumer>;
    }

    public componentWillUnmount() {
      this.forgetSyncSession();
    }

    private renderContext = (context: IRealmContext) => {
      if (context && this.realm !== context.realm) {
        this.forgetSyncSession();
        // Remember this Realm to avoid adding the notification more than once
        this.realm = context.realm;
        // Add a connection notification listener
        if (this.realm && this.realm.syncSession) {
          this.realm.syncSession.addConnectionNotification(
            this.onConnectionStateChange,
          );
        }
      }
      return this.props.children(this.state.connectionState);
    };

    private onConnectionStateChange = (
      connectionState: Realm.Sync.ConnectionState,
    ) => {
      // Unmounting the Provider component will close the Realm and synchroniously call this callback before
      // the listener is removed from the session. Therefore we need to check if the session has been removed before
      // updating the state
      if (this.realm && this.realm.syncSession) {
        this.setState({ connectionState });
      }
    };

    private forgetSyncSession() {
      if (this.realm && this.realm.syncSession) {
        this.realm.syncSession.removeConnectionNotification(
          this.onConnectionStateChange,
        );
        delete this.realm;
      }
    }
  }
  return RealmConnection;
};
