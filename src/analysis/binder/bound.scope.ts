import { BoundCellAssignment, Cell } from "../binder";

export class BoundScope {
  assignments = new Map<string, BoundCellAssignment>();
  cells = new Map<string, Cell>();

  constructor(public parent: BoundScope | null) {}

  create(name: string) {
    if (this.cells.has(name)) {
      return this.cells.get(name) as Cell;
    }
    const cell = new Cell(name);
    this.cells.set(name, cell);
    return cell;
  }
}
