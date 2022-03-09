// Shamelessly copied from https://github.com/kolodny/immutability-helper/blob/master/index.ts

declare module 'update-immutable' {
  export type CustomCommands<T> = T & { __noInferenceCustomCommandsBrand: any };

  export type Spec<T, C extends CustomCommands<object> = never> =
    | (
      T extends (Array<infer U> | ReadonlyArray<infer U>) ? ArraySpec<U, C> :
      T extends (Map<infer K, infer V> | ReadonlyMap<infer K, infer V>) ? MapSpec<K, V, C> :
      T extends (Set<infer X> | ReadonlySet<infer X>) ? SetSpec<X> :
      T extends object ? ObjectSpec<T, C> :
      never
    )
    | { $set: T }
    | { $apply: (v: T) => T }
    | ((v: T) => T)
    | (C extends CustomCommands<infer O> ? O : never);

  type ArraySpec<T, C extends CustomCommands<object>> =
    | { $push: ReadonlyArray<T> }
    | { $unshift: ReadonlyArray<T> }
    | { $splice: ReadonlyArray<[number, number?] | [number, number, ...T[]]> }
    | { [index: string]: Spec<T, C> }; // Note that this does not type check properly if index: number.

  type MapSpec<K, V, C extends CustomCommands<object>> =
    | { $add: ReadonlyArray<[K, V]> }
    | { $remove: ReadonlyArray<K> }
    | { [key: string]: Spec<V, C> };

  type SetSpec<T> =
    | { $add: ReadonlyArray<T> }
    | { $remove: ReadonlyArray<T> };

  type ObjectSpec<T, C extends CustomCommands<object>> =
    | { $toggle: ReadonlyArray<keyof T> }
    | { $unset: ReadonlyArray<keyof T> }
    | { $merge: Partial<T> }
    | { [K in keyof T]?: Spec<T[K], C> };

  export default function update<T, C extends CustomCommands<object> = never>(view: T, upd: Spec<T, C>): T;
}
