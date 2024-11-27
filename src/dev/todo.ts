class Logger {
  static isBrowser(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }

  static isNode(): boolean {
    return typeof process !== "undefined" && process.versions != null && process.versions.node != null;
  }

  static print(message: string) {
    console.log(`${"\x1b[35m"}${message}${"\x1b[0m"}`);
  }
}

export function Todo(message: string): ClassDecorator & MethodDecorator & PropertyDecorator {
  return (_target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    const location = Logger.isNode() ? " " + new Error().stack?.split("\n")[3]!.match(/\(([^)]+)\)/g)![0]! + "." : "";
    // property
    if (propertyKey && descriptor) {
      Logger.print(message + location);
      // if method
    } else if (propertyKey) {
      Logger.print(message + location);
      // if class
    } else {
      Logger.print(message + location);
    }
  };
}
