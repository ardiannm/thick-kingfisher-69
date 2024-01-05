import { Cell } from "./Cell";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";

export class BoundScope {
  Documents = new Map<string, Cell>();
  Diagnostics = new DiagnosticBag();

  constructor(public ParentScope?: BoundScope) {}

  StoreCell(Name: string) {
    // see if name exists in this or any other parent scope
    const Scope = this.ResolveScopeForCell(Name);
    let Document: Cell;
    if (Scope) {
      // if there is a scope with such a name get the document
      Document = Scope.Documents.get(Name) as Cell;
    } else {
      // if not create new cell document
      Document = new Cell(BoundKind.Cell, Name);
    }
    // and store it in the current scope
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

  GetDeclaredCells() {
    return this.Documents.values();
  }
}
