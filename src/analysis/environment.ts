import { Cell } from "../cell";
import { CompilerOptions } from "../compiler.options";
import { BoundFunctionExpression } from "./binder/function.expression";

export class Environment {
  cells = new Map<string, Cell>();
  functions = new Map<string, BoundFunctionExpression>();
  constructor(public parent: Environment | null, public configuration: CompilerOptions) {}

  createCell(row: string, column: string, name: string) {
    const environment = this.resolveEnvForCell(name);
    let data: Cell;
    if (environment) {
      data = environment.cells.get(name) as Cell;
    } else {
      data = Cell.createFrom(row, column, name);
    }
    this.cells.set(name, data);
    return data;
  }

  private resolveEnvForCell(name: string): Environment | null {
    if (this.cells.has(name)) {
      return this;
    }
    if (this.parent) {
      return this.parent.resolveEnvForCell(name);
    }
    return null;
  }

  transferToParent(cell: Cell) {
    if (this.parent) {
      this.parent.cells.set(cell.name, cell);
      this.cells.delete(cell.name);
      return true;
    }
    return false;
  }
}
