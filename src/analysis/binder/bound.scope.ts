import { Span } from "../text/span";
import { Cell } from "../../runtime/cell";
import { BoundExpression } from "./bound.expression";
import { BoundDefaultZero } from "./bound.default.zero";

export class BoundScope {
  references = new Map<string, Cell>();

  constructor(public parent: BoundScope | null) {}

  public getCell(name: string, span: Span): Cell {
    if (this.references.has(name)) {
      return this.references.get(name) as Cell;
    }
    const expression = BoundDefaultZero.createFrom(span);
    return this.createCell(name, expression);
  }

  public createCell(name: string, expression: BoundExpression) {
    return Cell.createFrom(this, name, expression);
  }
}
