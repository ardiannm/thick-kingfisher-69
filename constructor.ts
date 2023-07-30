// deno-lint-ignore-file no-explicit-any

export type Constructor<T> = new (...args: any[]) => T;

export function checkInstance<T>(instance: T, classConstructor: Constructor<T>): boolean {
  return instance instanceof classConstructor;
}
