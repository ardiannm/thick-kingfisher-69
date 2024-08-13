import { Cell } from "../../runtime/cell";
import { BoundCellReference } from "./bound.cell.reference";

export class BoundScope {
  public varibales: Map<string, Cell> = new Map();
  public stack: Array<BoundCellReference> = new Array();

  constructor(public parent: BoundScope | null) {}

  createOrGetCell(name: string): Cell {
    if (this.varibales.has(name)) {
      // console.log(name, "already exists");
      return this.varibales.get(name) as Cell;
    }
    // console.log(name, "created");
    return Cell.createFrom(name);
  }
}
