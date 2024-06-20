import { BoundKind } from "./kind/bound.kind";
import { Cell } from "../../cell";
import { BoundNumericLiteral } from "./numeric.literal";
import { CompilerOptions } from "../../compiler.options";
import { DiagnosticBag } from "../diagnostics/diagnostic.bag";
import { BoundFunctionExpression } from "./function.expression";

export class BoundScope {
  cells = new Map<string, Cell>();
  declarationSubscribers = new Set<(Cell: Cell) => void>();
  evaluationSubscribers = new Set<(Cell: Cell) => void>();
  functions = new Map<string, BoundFunctionExpression>();

  constructor(public parent: BoundScope | null, public configuration: CompilerOptions) {}

  constructCell(name: string, row: string, column: string) {
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

  checkDeclarations(diagnostics: DiagnosticBag) {
    this.cells.forEach((cell) => {
      if (!cell.declared) {
        diagnostics.undeclaredCell(cell.name);
      }
      cell.dependencies.forEach((dependency) => {
        if (!dependency.declared) {
          diagnostics.undeclaredCell(dependency.name);
        }
      });
      if (cell.contains(cell)) diagnostics.circularDependency(cell);
    });
  }

  move(dependency: Cell) {
    if (this.parent) {
      this.parent.cells.set(dependency.name, dependency);
      this.cells.delete(dependency.name);
      return true;
    }
    return false;
  }

  clearUndeclared() {
    this.cells.forEach((Cell) => {
      if (!Cell.declared) {
        this.cells.delete(Cell.name);
      }
      Cell.dependencies.forEach((dependency) => {
        if (!dependency.declared) {
          this.cells.delete(dependency.name);
        }
      });
    });
  }

  subscribeToDeclarationEvent(fn: (cell: Cell) => void) {
    this.declarationSubscribers.add(fn);
  }

  subscribeToEvaluationEvent(Fn: (cell: Cell) => void) {
    this.evaluationSubscribers.add(Fn);
  }

  emitDeclarationEventForCell(Node: Cell) {
    for (const sub of this.evaluationSubscribers) sub(Node);
  }

  emitEvaluationEventForCell(Node: Cell) {
    for (const sub of this.evaluationSubscribers) sub(Node);
  }
}
