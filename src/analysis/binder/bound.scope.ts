import { Span } from "../text/span";
import { BoundExpression } from "./bound.expression";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";

export class Cell {
  constructor(public declared: boolean) {}
}

export class BoundDefaultZero extends BoundNode {
  private constructor(public override span: Span) {
    super(BoundKind.BoundDefaultZero, span);
  }

  static createFrom(span: Span) {
    return new BoundDefaultZero(span);
  }
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
