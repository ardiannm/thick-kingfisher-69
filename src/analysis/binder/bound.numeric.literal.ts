import { TextSpan } from "../../lexing/text.span";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./bound.kind";

export class BoundNumericLiteral extends BoundExpression {
  constructor(public value: number, public override span: TextSpan) {
    super(BoundKind.BoundNumericLiteral, span);
  }
}
