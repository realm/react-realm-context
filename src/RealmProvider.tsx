import * as React from 'react';

import { IRealmContext } from '.';
import { withRealm } from './withRealm';

export interface IRealmProviderProps {
  path?: string;
}

export const generateRealmProvider = <P extends IRealmProviderProps>(
  WrappedProvider: React.Provider<IRealmContext>
): React.ComponentType<IRealmProviderProps> => {
  return withRealm((props: IRealmContext & { children?: React.ReactChildren }) => {
    // Spread the children prop and pass the rest on as context
    const { children, ...context } = props;
    return <WrappedProvider value={context} children={children} />
  });
};
