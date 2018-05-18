import * as React from 'react';
import * as Realm from 'realm';

import { IRealmContext, RealmConsumer } from '.';

type Value<T> = { results: Realm.Results<T>, realm: Realm };
type QueryChild<T> = (value: Value<T>) => React.ReactChild;

export type Sorting = string | Realm.SortDescriptor | Realm.SortDescriptor[];

export interface IRealmQueryProps<T> {
  children: QueryChild<T>;
  type: string | Realm.ObjectSchema | Function;
  filter?: string | any[];
  sort?: Sorting;
}

export const generateRealmQuery = (
  WrappedConsumer: React.Consumer<IRealmContext>
) => {

  class RealmQuery<T = any> extends React.Component<IRealmQueryProps<T>> {

    private realm?: Realm;
    private results?: Realm.Results<T>;

    // TODO: Add propTypes for non-TypeScript users
    // TODO: Allow the query to take a custom consumer as a prop

    public componentWillUnmount() {
      this.forgetRealm();
    }

    public render() {
      return <RealmConsumer>{this.renderContext}</RealmConsumer>;
    }

    private renderContext = (value: IRealmContext) => {
      const realm = this.getRealm(value.realm);
      // The results are not available yet (or we just forgot them)
      const results = this.getResults(realm);
      // Calling the function passed as children with the derived context
      return this.props.children({ results, realm });
    };

    private forgetRealm() {
      if (this.realm && !this.realm.isClosed) {
        this.forgetResults();
        this.realm.close();
      }
      delete this.realm;
    }

    private forgetResults() {
      if (this.results) {
        this.results.removeAllListeners();
        delete this.results;
      }
    }

    private getRealm(realm: Realm) {
      if (realm !== this.realm) {
        if (this.realm) {
          // The Realm changed and it was set already
          this.forgetRealm();
        }
        // Hang on to the new realm
        this.realm = realm;
      }
      return this.realm;
    }

    private getResults(realm: Realm) {
      const { type, filter, sort } = this.props;
      // Start with the type
      let results = realm.objects<T>(type);
      // Filtering
      if (filter) {
        if (typeof filter === 'string') {
          results = results.filtered(filter);
        } else {
          const [ query, ...args ] = filter;
          results = results.filtered(query as string, ...args);
        }
      }
      // Sorting
      if (sort) {
        if (typeof sort === 'string') {
          results = results.sorted(sort);
        } else if(Array.isArray(sort)) {
          if (
            sort.length === 2 &&
            typeof sort[0] === 'string' &&
            typeof sort[1] === 'boolean'
          ) {
            results = results.sorted(sort[0] as string, sort[1] as boolean);
          } else {
            results = results.sorted(sort as Realm.SortDescriptor[]);
          }
        } else {
          // TODO: Implement sorting on multiple fields
          throw new Error('Sorting reverse or on multiple properties are not implemented yet');
        }
      }

      // TODO: Handle an invalid result
      // Register a listener
      results.addListener(this.resultsChanged);
      // Save this for later use
      this.results = results;

      // Return
      return results;
    }

    private resultsChanged: Realm.CollectionChangeCallback<T> = (collection, change) => {
      // This might fire although nothing changed
      const { deletions, insertions, modifications } = change;
      const changes = deletions.length + insertions.length + modifications.length;
      if (changes > 0) {
        this.forceUpdate();
      }
    };
  }

  return RealmQuery;
};
