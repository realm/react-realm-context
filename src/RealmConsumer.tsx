import * as React from 'react';
import * as Realm from 'realm';

import { IRealmContext } from '.';

export type ConsumerChild = (context: IRealmContext) => React.ReactChild;

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
      const { realm } = value;
      // Calling the function passed as children with the derived context
      return this.props.children(value);
    };
  }

  return RealmConsumer;
};
