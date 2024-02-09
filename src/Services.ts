import { ColorPalette } from "./View/ColorPalette";
import { Evaluator } from "./Evaluator";
import { Cell } from "./Cell";
import { BoundProgram } from "./CodeAnalysis/Binding/BoundProgram";

export class Services {
  static Cache = new Set<string>();

  static ColumnIndexToLetter(column: number): string {
    let name = "";
    while (column > 0) {
      const remainder = (column - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      column = Math.floor((column - 1) / 26);
    }
    return name;
  }

  static ParseName(row: number, column: number) {
    return this.ColumnIndexToLetter(column) + row;
  }
}

export function Memoize() {
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

export function ClearMemo() {
  return function (Target: Evaluator, _PropertyKey: string, Descriptor: PropertyDescriptor) {
    const Method = Descriptor.value;
    Descriptor.value = function (this: typeof Target, Node: BoundProgram) {
      const Result = Method.apply(this, [Node]);
      if (Services.Cache.size) {
        console.log();
        console.log(ColorPalette.Gray("// clearing memo"));
        console.log();
        Services.Cache.clear();
      }
      return Result;
    };
    return Descriptor;
  };
}
