import { BoundNode } from "./bound.node";
import { BoundCell } from "./bound.cell";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundKind } from "./kind/bound.kind";

export class BoundScope extends BoundNode {
  public stack = new Array<BoundCellReference>();
  public varibales = new Map<string, BoundCell>();

  constructor(public parent: BoundScope | null) {
    super(BoundKind.BoundScope);
  }

  createOrGetCell(name: string): BoundCell {
    if (this.varibales.has(name)) {
      // console.log(name, "already exists");
      return this.varibales.get(name) as BoundCell;
    }
    // console.log(name, "created");
    return BoundCell.createFrom(name);
  }

  hasNext() {
    return this.stack.length;
  }

  getNext() {
    return this.stack.shift() as BoundCellReference;
  }
}
