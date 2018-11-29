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

export type ConsumerChild = (context: IRealmContext) => React.ReactNode;

export interface IRealmConsumerProps {
  children: ConsumerChild;
}

export const generateRealmConsumer = (
  WrappedConsumer: React.Consumer<IRealmContext>,
): React.ComponentType<IRealmConsumerProps> => {
  class RealmConsumer extends React.Component<IRealmConsumerProps> {
    // TODO: Add propTypes for non-TypeScript users
    // TODO: Complain if used without a Realm Provider

    public render() {
      return <WrappedConsumer>{this.renderContext}</WrappedConsumer>;
    }

    private renderContext = (value: IRealmContext) => {
      // Calling the function passed as children with the context
      return this.props.children(value);
    };
  }

  return RealmConsumer;
};
