import { Cell } from "./Cell";
import { BoundCellAssignment } from "./CodeAnalysis/Binder/BoundCellAssignment";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { BoundNumericLiteral } from "./CodeAnalysis/Binder/BoundNumericLiteral";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";

export class BoundScope {
  private Documents = new Map<string, Cell>();
  private Default = new Cell(
    "",
    0,
    new BoundNumericLiteral(BoundKind.NumericLiteral, 0),
    new Set<string>(),
    new Set<string>()
  );

  constructor(public ParentScope?: BoundScope) {}

  References = new Set<string>();
  Diagnostics = new DiagnosticBag();

  RegisterCell(Name: string) {
    this.References.add(Name);
  }

  private ResolveScopeForCell(Name: string): BoundScope | null {
    if (this.Documents.has(Name)) {
      return this;
    }
    if (this.ParentScope) {
      return this.ResolveScopeForCell(Name);
    }
    return null;
  }

  AssertGetCell(Name: string): Cell {
    const Scope = this.ResolveScopeForCell(Name);
    if (Scope) return Scope.Documents.get(Name) as Cell;
    this.Diagnostics.ReportUndefinedCell(Name);
    return this.Default;
  }

  DeclareCell(Bound: BoundCellAssignment) {
    for (const Subject of Bound.Subjects) this.AssertGetCell(Subject);
    const Scope = this.ResolveScopeForCell(Bound.Name);
    if (Scope) {
      this.UpdateCell(Scope, Bound);
      return false;
    }
    this.CreateCell(Bound);
    return true;
  }

  private UpdateCell(Scope: BoundScope, Bound: BoundCellAssignment) {
    const Document = Scope.Documents.get(Bound.Name) as Cell;
    Document.Expression = Bound.Expression;
    Document.Subjects = Bound.Subjects;
  }

  private CreateCell(Bound: BoundCellAssignment) {
    const Observers = new Set<string>();
    this.Documents.set(Bound.Name, new Cell(Bound.Name, 0, Bound.Expression, Bound.Subjects, Observers));
  }

  SetValueForCell(Node: BoundCellAssignment, Value: number) {
    this.AssertGetCell(Node.Name).Value = Value;
    return Value;
  }
}
