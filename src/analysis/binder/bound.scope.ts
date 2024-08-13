import { BoundNode } from "./bound.node";
import { Cell } from "../../runtime/cell";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundKind } from "./kind/bound.kind";

export class BoundScope extends BoundNode {
  public varibales: Map<string, Cell> = new Map();
  public stack: Array<BoundCellReference> = new Array();

  constructor(public parent: BoundScope | null) {
    super(BoundKind.BoundScope);
  }

  createOrGetCell(name: string): Cell {
    if (this.varibales.has(name)) {
      // console.log(name, "already exists");
      return this.varibales.get(name) as Cell;
    }
    // console.log(name, "created");
    return Cell.createFrom(name);
  }

  hasNext() {
    return this.stack.length;
  }

  getNext() {
    return this.stack.shift() as BoundCellReference;
  }
}
