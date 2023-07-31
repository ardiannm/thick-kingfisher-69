// deno-lint-ignore-file no-explicit-any

export type Constructor<T> = new (...args: any[]) => T;

export function assert<T>(instance: T, classConstructor: Constructor<T>): boolean {
  return instance instanceof classConstructor;
}
