import { Span } from "../text/span";
import { Cell } from "./bound.cell.reference";
import { BoundDefaultZero } from "./bound.default.zero";

export class BoundScope {
  values = new Map<string, Cell>();

  constructor(public parent: BoundScope | null) {}

  createCell(name: string, span: Span): Cell {
    if (this.values.has(name)) {
      return this.values.get(name) as Cell;
    }
    const expression = new BoundDefaultZero(span);
    const value = new Cell(0, expression);
    this.values.set(name, value);
    return value;
  }
}
