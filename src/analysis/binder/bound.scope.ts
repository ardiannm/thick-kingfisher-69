import { Span } from "../text/span";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundDefaultZero } from "./bound.default.zero";

export class Cell {
  observers = new Map<string, BoundCellReference>();
  dependencies = new Map<string, BoundCellReference>();
  constructor(public value: number, public expression: BoundDefaultZero) {}
}

export class BoundScope {
  vars = new Map<string, Cell>();
  current = new Map<string, BoundCellReference>();

  constructor(public parent: BoundScope | null) {}

  public bind(reference: string, span: Span) {
    if (this.vars.has(reference)) {
      return this.vars.get(reference) as Cell;
    } else {
      const newCell = new Cell(0, new BoundDefaultZero(span));
      this.vars.set(reference, newCell);
      return newCell;
    }
  }

  register(reference: BoundCellReference) {
    this.current.set(reference.name, reference);
  }
}
