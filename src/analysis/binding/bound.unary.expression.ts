import { Span } from "../../lexing/span";
import { BoundKind } from "./bound.kind";
import { BoundUnaryOperatorKind } from "./bound.kind";
import { BoundNode } from "./bound.node";

export class BoundUnaryExpression extends BoundNode {
  constructor(public operatorKind: BoundUnaryOperatorKind, public right: BoundNode, public override span: Span) {
    super(BoundKind.BoundUnaryExpression, span);
  }
}
