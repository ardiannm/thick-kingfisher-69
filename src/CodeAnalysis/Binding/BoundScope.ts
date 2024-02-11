import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { BoundKind } from "./Kind/BoundKind";
import { Cell } from "../../Cell";
import { BoundNumericLiteral } from "./BoundNumericLiteral";

export class BoundScope {
  Cells = new Map<string, Cell>();

  constructor(public ParentScope: BoundScope | null) {}

  ConstructCell(Name: string) {
    const Scope = this.ResolveScopeForCell(Name);
    let Data: Cell;
    if (Scope) {
      Data = Scope.Cells.get(Name) as Cell;
    } else {
      const Expression = new BoundNumericLiteral(BoundKind.NumericLiteral, 0);
      Data = new Cell(BoundKind.Cell, Name, false, 0, Expression, new Map<string, Cell>(), new Map<string, Cell>(), "0");
    }
    this.Cells.set(Name, Data);
    return Data;
  }

  private ResolveScopeForCell(Name: string): BoundScope | null {
    if (this.Cells.has(Name)) {
      return this;
    }
    if (this.ParentScope) {
      return this.ParentScope.ResolveScopeForCell(Name);
    }
    return null;
  }

  CheckDeclarations(Diagnostics: DiagnosticBag) {
    this.Cells.forEach((Cell) => {
      if (!Cell.Declared) {
        Diagnostics.UndeclaredCell(Cell.Name);
      }
      Cell.Dependencies.forEach((Dependency) => {
        if (!Dependency.Declared) {
          Diagnostics.UndeclaredCell(Dependency.Name);
        }
      });
      if (Cell.Contains(Cell)) Diagnostics.CircularDependency(Cell);
    });
  }

  Move(Dependency: Cell) {
    if (this.ParentScope) {
      this.ParentScope.Cells.set(Dependency.Name, Dependency);
      this.Cells.delete(Dependency.Name);
      return true;
    }
    return false;
  }
}
