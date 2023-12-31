import { Cell } from "./Cell";
import { BoundCellAssignment } from "./CodeAnalysis/Binder/BoundCellAssignment";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";

export class BoundScope {
  private Documents = new Map<string, Cell>();
  constructor(public ParentScope?: BoundScope) {}

  References = new Set<string>();
  Diagnostics = new DiagnosticBag();

  RegisterCell(Name: string) {
    this.References.add(Name);
  }

  GetCell(Name: string): Cell | undefined {
    if (this.Documents.has(Name)) {
      return this.Documents.get(Name) as Cell;
    }
    if (this.ParentScope) {
      return this.ParentScope.GetCell(Name) as Cell;
    }
    return undefined;
  }

  DeclareCell(Bound: BoundCellAssignment) {
    this.EnsureSubjectsExist(Bound.Subjects);
    const Document = this.Documents.get(Bound.Name);
    if (Document) {
      for (const Subject of Document.Subjects) {
        this.GetCell(Subject)?.DoNotNotify(Bound.Name);
      }
      Document.Subjects = Bound.Subjects;
      for (const Subject of Document.Subjects) {
        this.GetCell(Subject)?.Notify(Bound.Name);
      }
      Document.Expression = Bound.Expression;
      return false;
    }
    this.Documents.set(Bound.Name, new Cell(Bound.Name, 0, Bound.Expression, Bound.Subjects, new Set<string>()));
    for (const Subject of Bound.Subjects) {
      this.GetCell(Subject)?.Notify(Bound.Name);
    }
    return true;
  }

  EnsureSubjectsExist(Subjects: Set<string>) {
    for (const Subject of Subjects) {
      if (!this.GetCell(Subject)) this.Diagnostics.ReportUndefinedCell(Subject);
    }
  }
}
