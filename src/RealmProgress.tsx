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

interface IProgress {
  transferred: number;
  transferable: number;
}

interface IRealmProgressState {
  download?: IProgress;
  upload?: IProgress;
}

/**
 * Passed to the render-prop callback provided as `children` to `RealmProgress`.
 */
export interface IRealmProgressValue
  extends IRealmProgressState,
    IRealmContext {
  /**
   * Is the realm in the progress of either downloading or uploading?
   * It's meaning depends on the `direction` provided as prop to `RealmProgress`.
   */
  isLoading: boolean;

  /**
   * This will be true if we're downloading and the transferred are less than the transferable.
   */
  isDownloading: boolean;

  /**
   * This will be true if we're uploading and the transferred are less than the transferable.
   */
  isUploading: boolean;
}

/**
 * Props passed to a RealmProgress component.
 */
export interface IRealmProgressProps {
  /**
   * In what direction should the callback passed as `children` be called?
   * Possible values are "download", "upload" or "both" (default).
   */
  direction?: Realm.Sync.ProgressDirection | 'both';
  /**
   * Should the callback passed as `children` be called indefinitly or just for outstanding work which has not been
   * uploaded / downloaded since the point of mounting the component?
   */
  mode?: Realm.Sync.ProgressMode;
  children: (value: IRealmProgressValue) => React.ReactChild;
}

/**
 * Generates a RealmProgress wrapping a context consumer.
 *
 * Use {@link createRealmContext} or the default RealmProgress instead of calling this directly.
 */
export const generateRealmProgress = (
  WrappedConsumer: React.Consumer<IRealmContext>,
): React.ComponentType<IRealmProgressProps> => {
  /**
   * Adds a listener to the connection state (using `syncSession.addConnectionNotification`) and renders the function
   * passed as children, like a [render prop](https://reactjs.org/docs/render-props.html#using-props-other-than-render).
   */
  class RealmProgress extends React.Component<
    IRealmProgressProps,
    IRealmProgressState
  > {
    /**
     * The state stores the latest known state of connection, defaults to disconnected.
     */
    public state: IRealmProgressState = {};

    private realm: Realm;

    /**
     * Renders the component.
     */
    public render() {
      return <WrappedConsumer>{this.renderContext}</WrappedConsumer>;
    }

    public componentWillUnmount() {
      this.forgetRealm();
    }

    private renderContext = (context: IRealmContext) => {
      const { direction = 'both', mode = 'reportIndefinitely' } = this.props;
      if (context && this.realm !== context.realm) {
        this.forgetRealm();
        // Remember this sync session to avoid adding the notification more than once
        this.realm = context.realm;
        // Add a progress notification listeners, using process.nextTick to avoid calls to setState in the renderer
        process.nextTick(() => {
          const { syncSession } = this.realm;
          if (syncSession) {
            if (direction === 'download' || direction === 'both') {
              syncSession.addProgressNotification(
                'download',
                mode,
                this.onDownloadProgress,
              );
            }
            if (direction === 'upload' || direction === 'both') {
              syncSession.addProgressNotification(
                'upload',
                mode,
                this.onUploadProgress,
              );
            }
          }
        });
      }
      // Render the children
      const isDownloading = !!(
        this.state.download &&
        this.state.download.transferred < this.state.download.transferable
      );
      const isUploading = !!(
        this.state.upload &&
        this.state.upload.transferred < this.state.upload.transferable
      );
      const isLoading = isDownloading || isUploading;
      return this.props.children({
        ...this.state,
        ...context,
        isLoading,
        isDownloading,
        isUploading,
      });
    };

    private onDownloadProgress: Realm.Sync.ProgressNotificationCallback = (
      transferred: number,
      transferable: number,
    ) => {
      if (this.realm && this.realm.syncSession) {
        this.setState({ download: { transferred, transferable } });
      }
    };

    private onUploadProgress: Realm.Sync.ProgressNotificationCallback = (
      transferred: number,
      transferable: number,
    ) => {
      if (this.realm && this.realm.syncSession) {
        this.setState({ upload: { transferred, transferable } });
      }
    };

    private forgetRealm() {
      if (this.realm && this.realm.syncSession) {
        this.realm.syncSession.removeProgressNotification(
          this.onDownloadProgress,
        );
        this.realm.syncSession.removeProgressNotification(
          this.onUploadProgress,
        );
        delete this.realm;
      }
    }
  }
  return RealmProgress;
};
