import { Cell } from "./Cell";
import { BoundKind } from "./CodeAnalysis/Binder/BoundKind";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";

export class BoundScope {
  Documents = new Map<string, Cell>();
  Diagnostics = new DiagnosticBag();

  constructor(public ParentScope?: BoundScope) {}

  StoreCell(Name: string) {
    if (this.Documents.has(Name)) {
      return this.Documents.get(Name) as Cell;
    }
    const Document = new Cell(BoundKind.Cell, Name);
    this.Documents.set(Name, Document);
    return Document;
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
}
