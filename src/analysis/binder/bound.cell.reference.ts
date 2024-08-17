import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { Cell } from "./bound.scope";
import { BoundExpression } from "./bound.expression";

export class BoundCellReference extends BoundNode {
  constructor(public name: string, public value: Cell, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
