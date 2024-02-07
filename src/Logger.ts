import { Cell } from "./Cell";
import { Evaluator } from "./Evaluator";

export class Logger {
  static Map = new Map<string, number>();

  static Mapper() {
    return function (Target: Evaluator, _PropertyKey: string, Descriptor: PropertyDescriptor) {
      const Method = Descriptor.value;
      Descriptor.value = function (this: typeof Target, Node: Cell) {
        const Evaluated = Node.Evaluated;
        const Result = Method.apply(this, [Node]);
        if (Evaluated) return Result;
        if (Logger.Map.has(Node.Name)) {
          Logger.Map.set(Node.Name, (Logger.Map.get(Node.Name) as number) + 1);
        } else {
          Logger.Map.set(Node.Name, 1);
        }
        return Result;
      };
      return Descriptor;
    };
  }
}
