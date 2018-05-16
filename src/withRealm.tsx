import * as React from 'react';
import hoistStatics = require('hoist-non-react-statics');

import { IRealmContext } from '.';

// @see https://stackoverflow.com/questions/48215950/exclude-property-from-type
type Omit<T, K> = Pick<T, Exclude<keyof T, keyof K>>

interface IRealmProviderProps {
  path?: string;
}

function getDisplayName(Component: any) {
  return Component.displayName || Component.name || "Component";
}

export const withRealm = <
  P extends IRealmContext,
  W extends React.ComponentType<P>
>(
  UnwrappedComponent: W,
) => {
  // Set a useful displayName on the HOC
  const displayName = getDisplayName(UnwrappedComponent);

  type ICombinedProps = Omit<P, IRealmContext> & IRealmProviderProps;
  type IRealmComponentProps = ICombinedProps & { forwardRef?: any; };

  class RealmComponent extends React.Component<IRealmComponentProps, {}> {
    static displayName = `withRealm(${displayName})`;

    public render() {
      const props = this.getProps();
      // The next line is needed because "W extends " in the generic throws off TypeScript
      const Unwrapped: React.ComponentType<P> = UnwrappedComponent;
      // Passing these through and object to prevent typechecker from complaining about excess props
      const excessProps = {
        ref: this.props.forwardRef,
      };
      return (
        <Unwrapped {...this.props} {...props} {...excessProps} />
      );
    }

    private getProps(): IRealmContext {
      return { realm: null };
    }
  }

  // Make sure any ref is forwarded to the right component
  const ForwardRef = React.forwardRef<any, any>((props, ref) => (
    <RealmComponent {...props} forwardRef={ref} />
  ));

  // Hoist static methods
  hoistStatics<any, typeof UnwrappedComponent>(ForwardRef, UnwrappedComponent);
  // including the displayName we just defined on the RealmComponent class
  ForwardRef.displayName = RealmComponent.displayName;

  // Return the refForwarding, static hoisting withRealm HOC
  // FIXME: The "& W" seems needed to extract W's statics - but its unclear
  //        why that does not force the returned component to include props
  //        that not optional for W.
  return ForwardRef as React.ComponentClass<ICombinedProps> & W;
};
