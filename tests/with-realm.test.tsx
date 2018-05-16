import * as assert from 'assert';
import * as util from 'util';
import * as React from 'react';
import * as Realm from 'react';
import * as renderer from 'react-test-renderer';

import { withRealm } from '../src';

class ComponentWithStatics extends React.Component<{
  realm: Realm;
}> {
  static field = 'value';

  public render() {
    return JSON.stringify(this.props);
  }
}

describe('withRealm', () => {
  it('sets the displayName', () => {
    const WrappedComponent = withRealm(ComponentWithStatics);
    assert.equal(
      WrappedComponent.displayName,
      'withRealm(ComponentWithStatics)',
    );
  });

  it('hoists the statics', () => {
    const WrappedComponent = withRealm(ComponentWithStatics);
    assert.equal(
      WrappedComponent.field,
      'value',
    );
  });

  it('passes children prop to the wrapped component', () => {
    interface IPureComponentProps {
      realm: Realm;
      children: React.ReactChildren;
    }
    const pureComponent = ({ children }: IPureComponentProps) => (
      <div>{children}</div>
    );
    const WrappedComponent = withRealm(pureComponent);
    const tree = renderer.create(<WrappedComponent path="...">hello!</WrappedComponent>).toJSON();
    assert.equal(tree.type, 'div');
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0], 'hello!');
  });

  it('delegates ref to the wrapped component', () => {
    let result: any;
    const WrappedComponent = withRealm(ComponentWithStatics);
    const tree = renderer.create(
      // someProp="hello!"
      <WrappedComponent ref={(e: any) => result = e} />
    );
    // Assert that the
    assert(result instanceof ComponentWithStatics);
  });

  it.skip('passes props to the wrapped component', () => {
    interface IPureComponentProps {
      realm: Realm;
      someProp: string;
    }
    const pureComponent = ({ someProp }: IPureComponentProps) => (
      <div>{someProp}</div>
    );
    const WrappedComponent = withRealm(pureComponent);
    const tree = renderer.create(
      // someProp="hello!"
      <WrappedComponent path="..." />
    ).toJSON();
    assert.equal(tree.type, 'div');
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0], 'hello!');
  });
});
