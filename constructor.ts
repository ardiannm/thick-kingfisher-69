export type Constructor = new (...args: any[]) => any;

export function assert(instance: any, classConstructor: Constructor): boolean {
  return instance instanceof classConstructor;
}
