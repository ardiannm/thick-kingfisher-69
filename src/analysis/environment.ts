import { BoundKind } from "./binder/kind/bound.kind";
import { Cell } from "../cell";
import { BoundNumericLiteral } from "./binder/numeric.literal";
import { CompilerOptions } from "../compiler.options";
import { BoundFunctionExpression } from "./binder/function.expression";

export class Environment {
  cells = new Map<string, Cell>();
  declarationSubscribers = new Set<(Cell: Cell) => void>();
  evaluationSubscribers = new Set<(Cell: Cell) => void>();
  functions = new Map<string, BoundFunctionExpression>();

  constructor(public parent: Environment | null, public configuration: CompilerOptions) {}

  createCell(name: string, row: string, column: string) {
    const environment = this.resolveEnvForCell(name);
    let data: Cell;
    if (environment) {
      data = environment.cells.get(name) as Cell;
    } else {
      const expression = new BoundNumericLiteral(0);
      data = new Cell(BoundKind.Cell, name, false, 0, expression, new Map<string, Cell>(), new Map<string, Cell>(), "0", parseFloat(row), Cell.letterToColumnIndex(column));
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
