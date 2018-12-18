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
import * as Realm from 'realm';

import { IRealmConsumerProps } from '.';

/**
 * A generic type helper which removes one or more properties from an interface.
 */
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

// Props extends { [Property in TKey]: Realm}, TKey extends keyof Props

/**
 * Generates a withRealm function wrapping a context consumer.
 *
 * Use {@link createRealmContext} or the default withRealm instead of calling this directly.
 */
export function generateWithRealm(
  Consumer: React.ComponentType<IRealmConsumerProps>,
) {
  // Default key is "realm"
  function withRealm<Props extends { realm: Realm }>(
    Component: React.ComponentType<Props>,
  ): React.ComponentType<Omit<Props, 'realm'>>;
  // Alternatively a key is passed as a second argument
  function withRealm<
    Props extends { [P in TKey]: Realm },
    TKey extends keyof Props
  >(
    Component: React.ComponentType<Props>,
    key: TKey,
    consumerProps?: Partial<IRealmConsumerProps>,
  ): React.ComponentType<Omit<Props, TKey>>;
  // Implementation doesn't care about the key
  function withRealm<Props extends object>(
    Component: React.ComponentType<Props>,
    key: string = 'realm',
    consumerProps: Partial<IRealmConsumerProps> = {},
  ) {
    /**
     * [Higher order component](https://reactjs.org/docs/higher-order-components.html) enhancing the wrapped component
     * by injecting a Realm into its props.
     */
    return class WithRealm extends React.Component<Props> {
      /**
       * Renders the component.
       */
      public render() {
        return (
          <Consumer {...consumerProps}>
            {context => {
              // Inject a prop using the key supplied by the caller
              const injectedProps = { [key]: context.realm };
              return <Component {...this.props} {...injectedProps} />;
            }}
          </Consumer>
        );
      }
    };
  }
  // Return the enhancing HOC
  return withRealm;
}
