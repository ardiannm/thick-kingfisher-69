import { BoundCellReference } from "./bound.cell.reference";

export class Cell {
  observers = new Map<string, BoundCellReference>();
  dependencies = new Map<string, BoundCellReference>();
  constructor(public value: number) {}
}

export class BoundScope {
  vars = new Map<string, Cell>();
  current = new Map<string, BoundCellReference>();

  constructor(public parent: BoundScope | null) {}

  public bind(reference: string) {
    if (this.vars.has(reference)) {
      return this.vars.get(reference) as Cell;
    } else {
      const newCell = new Cell(0);
      this.vars.set(reference, newCell);
      return newCell;
    }
  }

  register(reference: BoundCellReference) {
    this.current.set(reference.name, reference);
  }
}
