// deno-lint-ignore no-explicit-any
type Constructor<Class> = new (...args: any[]) => Class;

export default Constructor;
