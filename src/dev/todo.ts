class Environment {
  static isBrowser(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }

  static isNode(): boolean {
    return typeof process !== "undefined" && process.versions != null && process.versions.node != null;
  }

  static report(message: string) {
    console.log(`${"\x1b[35m"}${message}${"\x1b[0m"}`);
  }
}

export function Todo(message: string): ClassDecorator & MethodDecorator & PropertyDecorator {
  return (_target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (Environment.isNode()) {
      const location = new Error().stack?.split("\n")[3]!.match(/\(([^)]+)\)/g)![0]! + ".";
      // property
      if (propertyKey && descriptor) {
        Environment.report(message + location);
        // method
      } else if (propertyKey) {
        Environment.report(message + location);
        // class
      } else {
        Environment.report(message + location);
      }
    }
  };
}
