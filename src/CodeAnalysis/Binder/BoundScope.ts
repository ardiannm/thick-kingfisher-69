import { Cell } from "../../Cell";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { BoundKind } from "./Kind/BoundKind";
import { BoundNumericLiteral } from "./BoundNumericLiteral";

export class BoundScope {
  private Documents = new Map<string, Cell>();

  constructor(public ParentScope: BoundScope | null) {}

  ConstructCell(Name: string) {
    const Scope = this.ResolveScopeForCell(Name);
    let Document: Cell;
    if (Scope) {
      Document = Scope.Documents.get(Name) as Cell;
    } else {
      const Expression = new BoundNumericLiteral(BoundKind.NumericLiteral, 0);
      Document = new Cell(BoundKind.Cell, Name, false, 0, Expression, new Map<string, Cell>(), new Map<string, Cell>(), "0");
    }
    this.Documents.set(Name, Document);
    return Document;
  }

  private ResolveScopeForCell(Name: string): BoundScope | null {
    if (this.Documents.has(Name)) {
      return this;
    }
    if (this.ParentScope) {
      return this.ParentScope.ResolveScopeForCell(Name);
    }
    return null;
  }

  GetCells() {
    return this.Documents.values();
  }

  GetCell(Name: string) {
    const Scope = this.ResolveScopeForCell(Name);
    if (Scope) return Scope.Documents.get(Name) as Cell;
    return null;
  }

  CheckDeclarations(Diagnostics: DiagnosticBag) {
    for (const Cell of this.GetCells()) {
      if (!Cell.Declared) Diagnostics.UndeclaredCell(Cell.Name);
      Cell.Subjects.forEach((Subject) => {
        if (!Subject.Declared) Diagnostics.UndeclaredCell(Subject.Name);
      });
      const Circular = Cell.IsCircular(Diagnostics);
      if (Circular) Diagnostics.CircularDependency(Cell.Name, Circular.Name);
    }
  }

  get Count() {
    return this.Documents.size;
  }
}
