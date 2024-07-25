import { BoundKind } from "./kind/bound.kind";
import { Cell } from "../../cell";
import { BoundNumericLiteral } from "./numeric.literal";
import { CompilerOptions } from "../../compiler.options";
import { BoundFunctionExpression } from "./function.expression";

export class BoundScope {
  cells = new Map<string, Cell>();
  declarationSubscribers = new Set<(Cell: Cell) => void>();
  evaluationSubscribers = new Set<(Cell: Cell) => void>();
  functions = new Map<string, BoundFunctionExpression>();

  constructor(public parent: BoundScope | null, public configuration: CompilerOptions) {}

  createCell(name: string, row: string, column: string) {
    const scope = this.resolveScopeForCell(name);
    let data: Cell;
    if (scope) {
      data = scope.cells.get(name) as Cell;
    } else {
      const expression = new BoundNumericLiteral(0);
      data = new Cell(BoundKind.Cell, name, false, 0, expression, new Map<string, Cell>(), new Map<string, Cell>(), "0", parseFloat(row), Cell.letterToColumnIndex(column));
    }
    this.cells.set(name, data);
    return data;
  }

  private resolveScopeForCell(name: string): BoundScope | null {
    if (this.cells.has(name)) {
      return this;
    }
    if (this.parent) {
      return this.parent.resolveScopeForCell(name);
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
