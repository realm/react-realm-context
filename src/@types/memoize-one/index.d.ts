// Type definitions for memoize-one 4.1
// Project: https://github.com/alexreardon/memoize-one#readme
// Definitions by: Karol Majewski <https://github.com/karol-majewski>, Frank Li <https://github.com/franklixuefei>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'memoize-one' {
  type EqualityFn = (a: any, b: any, index: number) => boolean;

  function memoizeOne<T extends (...args: any[]) => any>(
    resultFn: T,
    isEqual?: EqualityFn,
  ): T;

  namespace memoizeOne {

  }

  export = memoizeOne;
}
