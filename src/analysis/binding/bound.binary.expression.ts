import { Span } from "../../lexing/span";
import { BoundBinaryOperatorKind } from "./bound.kind";
import { BoundKind } from "./bound.kind";
import { BoundNode } from "./bound.node";

export class BoundBinaryExpression extends BoundNode {
  constructor(public left: BoundNode, public operatorKind: BoundBinaryOperatorKind, public right: BoundNode, public override span: Span) {
    super(BoundKind.BoundBinaryExpression, span);
  }
}
