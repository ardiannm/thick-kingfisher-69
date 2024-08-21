import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { BoundExpression } from "./bound.expression";

export class BoundCell extends BoundNode {
  constructor(public name: string, public value: number, public expression: BoundExpression, public override span: Span) {
    super(BoundKind.BoundCell, span);
  }
}
