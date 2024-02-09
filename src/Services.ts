import { ColorPalette } from "./View/ColorPalette";
import { Evaluator } from "./Evaluator";
import { Cell } from "./Cell";

export class Services {
  static Cache = new Set<string>();
  private constructor() {}

  static ColumnIndexToLetter(Column: number): string {
    let Name = "";
    while (Column > 0) {
      const Remainder = (Column - 1) % 26;
      Name = String.fromCharCode(65 + Remainder) + Name;
      Column = Math.floor((Column - 1) / 26);
    }
    return Name;
  }

  static NotationA1(Row: number, Column: number) {
    return this.ColumnIndexToLetter(Column) + Row;
  }

  /** @deprecated keeps memoizing even when a cell node is re assigned, and that has to go this will have to be deprecated */
  static Memoize() {
    return function (Target: Evaluator, _PropertyKey: string, Descriptor: PropertyDescriptor) {
      const Method = Descriptor.value;
      Descriptor.value = function (this: typeof Target, Node: Cell) {
        if (Services.Cache.has(Node.Name)) {
          console.log(ColorPalette.Gray(Node.Name + " [" + Node.Value + "] memoized "));
          return Node.Value;
        }
        console.log(ColorPalette.Azure(Node.Name + " [" + Node.Value + "] computed "));
        const Result = Method.apply(this, [Node]) as number;
        Services.Cache.add(Node.Name);
        return Result;
      };
      return Descriptor;
    };
  }
}
