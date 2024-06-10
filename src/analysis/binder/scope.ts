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

  ConstructCell(name: string, row: string, column: string) {
    const scope = this.ResolveScopeForCell(name);
    let data: Cell;
    if (scope) {
      data = scope.cells.get(name) as Cell;
    } else {
      const expression = new BoundNumericLiteral(BoundKind.NumericLiteral, 0);
      data = new Cell(BoundKind.Cell, name, false, 0, expression, new Map<string, Cell>(), new Map<string, Cell>(), "0", parseFloat(row), Cell.LetterToColumnIndex(column));
    }
    this.cells.set(name, data);
    return data;
  }

  private ResolveScopeForCell(name: string): BoundScope | null {
    if (this.cells.has(name)) {
      return this;
    }
    if (this.parent) {
      return this.parent.ResolveScopeForCell(name);
    }
    return null;
  }

  CheckDeclarations(diagnostics: DiagnosticBag) {
    this.cells.forEach((cell) => {
      if (!cell.declared) {
        diagnostics.UndeclaredCell(cell.name);
      }
      cell.dependencies.forEach((dependency) => {
        if (!dependency.declared) {
          diagnostics.UndeclaredCell(dependency.name);
        }
      });
      if (cell.Contains(cell)) diagnostics.CircularDependency(cell);
    });
  }

  Move(dependency: Cell) {
    if (this.parent) {
      this.parent.cells.set(dependency.name, dependency);
      this.cells.delete(dependency.name);
      return true;
    }
    return false;
  }

  ClearUndeclared() {
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

  SubscribeToDeclarationEvent(fn: (cell: Cell) => void) {
    this.declarationSubscribers.add(fn);
  }

  SubscribeToEvaluationEvent(Fn: (cell: Cell) => void) {
    this.evaluationSubscribers.add(Fn);
  }

  EmitDeclarationEventForCell(Node: Cell) {
    for (const sub of this.evaluationSubscribers) sub(Node);
  }

  EmitEvaluationEventForCell(Node: Cell) {
    for (const sub of this.evaluationSubscribers) sub(Node);
  }
}
