import { TextSpan } from "../../lexing/text.span";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./bound.kind";
import { BoundUnaryOperatorKind } from "./bound.kind";

export class BoundUnaryExpression extends BoundExpression {
  constructor(public operatorKind: BoundUnaryOperatorKind, public right: BoundExpression, public override span: TextSpan) {
    super(BoundKind.BoundUnaryExpression, span);
  }
}
