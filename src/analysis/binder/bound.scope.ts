import { BoundNode } from "./bound.node";
import { BoundCell } from "./bound.cell";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundKind } from "./kind/bound.kind";

export class BoundScope extends BoundNode {
  public references = new Array<BoundCellReference>();
  private declared = new Map<string, BoundCell>();

  constructor(public parent: BoundScope | null) {
    super(BoundKind.BoundScope);
  }

  createCell(name: string): BoundCell {
    if (this.declared.has(name)) {
      // console.log(name, "already exists");
      return this.declared.get(name) as BoundCell;
    }
    // console.log(name, "created");
    return BoundCell.createFrom(name);
  }

  clearStack() {
    this.references.length = 0;
  }

  hasMore() {
    return this.references.length;
  }

  getNextReference() {
    return this.references.shift() as BoundCellReference;
  }

  registerReference(reference: BoundCellReference) {
    this.references.push(reference);
  }

  declareCell(cell: BoundCell) {
    this.declared.set(cell.name, cell);
  }

  isDeclared(cell: string) {
    return this.declared.has(cell);
  }
}
