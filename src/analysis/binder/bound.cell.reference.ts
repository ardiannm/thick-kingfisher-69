import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { BoundExpression } from "./bound.expression";

export class Cell {
  constructor(public value: number, public expression: BoundExpression) {}
}

export class BoundCellReference extends BoundNode {
  constructor(public name: string, public cell: Cell, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
