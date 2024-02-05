import { Cell } from "./Cell";

export class Logger {
  static Map = new Map<string, number>();

  static Count() {
    return function (Target: Cell, _PropertyKey: string, Descriptor: PropertyDescriptor) {
      const Method = Descriptor.value;
      Descriptor.value = function (this: typeof Target, ...args: any[]) {
        const Result = Method.apply(this, args);
        if (Logger.Map.has(this.Name)) {
          Logger.Map.set(this.Name, (Logger.Map.get(this.Name) as number) + 1);
        } else {
          Logger.Map.set(this.Name, 1);
        }
        return Result;
      };
      return Descriptor;
    };
  }
}
