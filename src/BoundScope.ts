import { Cell } from "./Cell";
import { BoundCellAssignment } from "./CodeAnalysis/Binder/BoundCellAssignment";

export class BoundScope {
  constructor(public ParentScope?: BoundScope) {}

  References = new Set<string>();
  private Documents = new Map<string, Cell>();

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
    const Document = this.Documents.get(Bound.Name);
    if (Document) {
      Document.Expression = Bound.Expression;
      return false;
    }
    this.Documents.set(Bound.Name, new Cell(Bound.Name, 0, Bound.Expression, Bound.Subjects, new Set<string>()));
    return true;
  }
}
