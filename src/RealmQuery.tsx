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

import memoizeOne from 'memoize-one';
import React from 'react';
import Realm from 'realm';

import { IRealmContext } from '.';

interface IValue<T> {
  results: Realm.Results<T>;
  realm: Realm;
}

type QueryChild<T> = (value: IValue<T>) => React.ReactChild;

/**
 * Something to filter the results by.
 */
export type Filtering = string | any[];

/**
 * Something to sort the results by.
 */
export type Sorting = string | Realm.SortDescriptor | Realm.SortDescriptor[];

/**
 * Props passed to a RealmQuery component.
 */
export interface IRealmQueryProps<T> {
  children: QueryChild<T>;
  type: string;
  filter?: Filtering;
  sort?: Sorting;
}

/**
 * Generates a RealmQuery wrapping a context consumer.
 *
 * Use {@link createRealmContext} or the default RealmQuery instead of calling this directly.
 */
export const generateRealmQuery = (
  WrappedConsumer: React.Consumer<IRealmContext>,
): React.ComponentType<IRealmQueryProps<any>> => {
  class RealmQuery<T> extends React.Component<IRealmQueryProps<T>> {
    private results?: Realm.Results<T>;
    private memoizedResults = memoizeOne(
      (realm: Realm, type: string, filter: Filtering, sort: Sorting) => {
        // Forget any results we have already returned
        this.forgetResults();

        // Start with the type
        let results = realm.objects<T>(type);
        // Filtering
        if (filter) {
          if (typeof filter === 'string') {
            results = results.filtered(filter);
          } else {
            const [query, ...args] = filter;
            results = results.filtered(query as string, ...args);
          }
        }
        // Sorting
        if (sort) {
          if (typeof sort === 'string') {
            results = results.sorted(sort);
          } else if (Array.isArray(sort)) {
            results =
              sort.length === 2 &&
              typeof sort[0] === 'string' &&
              typeof sort[1] === 'boolean'
                ? results.sorted(sort[0] as string, sort[1] as boolean)
                : results.sorted(sort as Realm.SortDescriptor[]);
          } else {
            // TODO: Implement sorting on multiple fields
            throw new Error(
              'Sorting reverse or on multiple properties are not implemented yet',
            );
          }
        }

        // TODO: Handle an invalid result
        // Register a listener - if we do this on a read-only Realm, Realm JS will throw:
        // "Cannot create asynchronous query for immutable Realms"
        if (!realm.readOnly) {
          results.addListener(this.resultsChanged);
        }
        // Save this for later use
        this.results = results;

        // Return
        return results;
      },
    );

    // TODO: Add propTypes for non-TypeScript users
    // TODO: Allow the query to take a custom consumer as a prop

    public componentWillUnmount() {
      this.forgetResults();
    }

    /**
     * Renders the component.
     */
    public render() {
      return <WrappedConsumer>{this.renderContext}</WrappedConsumer>;
    }

    private renderContext = (value: IRealmContext) => {
      // The results are not available yet (or we just forgot them)
      const { type, filter, sort } = this.props;
      const results = this.memoizedResults(value.realm, type, filter, sort);
      // Calling the function passed as children with the derived context
      return this.props.children({ results, realm: value.realm });
    };

    private forgetResults() {
      if (this.results) {
        this.results.removeAllListeners();
        delete this.results;
      }
    }

    private resultsChanged: Realm.CollectionChangeCallback<T> = (
      collection,
      change,
    ) => {
      // This might fire although nothing changed
      const { deletions, insertions, modifications } = change;
      const changes =
        deletions.length + insertions.length + modifications.length;
      if (changes > 0) {
        this.forceUpdate();
      }
    };
  }

  return RealmQuery;
};
