import { Span } from "../text/span";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundDefaultZero } from "./bound.default.zero";
import { BoundExpression } from "./bound.expression";
import { BoundNode } from "./bound.node";

export class Cell {
  observers = new Map<string, BoundCellReference>();
  dependencies = new Map<string, BoundCellReference>();

  constructor(public declared: boolean) {}
}

export class BoundScope {
  values = new Map<string, Cell>();
  expressions = new Map<string, BoundExpression>();

  constructor(public parent: BoundScope | null) {}

  getExpression(text: string, span: Span) {
    if (!this.expressions.has(text)) {
      this.expressions.set(text, BoundDefaultZero.createFrom(span));
    }
    return this.expressions.get(text) as BoundExpression;
  }

  setExpression(text: string, expression: BoundNode) {
    this.expressions.set(text, expression);
  }

  get(text: string) {
    if (!this.values.has(text)) {
      this.values.set(text, new Cell(false));
    }
    return this.values.get(text) as Cell;
  }
}
