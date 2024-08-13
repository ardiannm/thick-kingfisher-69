import { Span } from "../text/span";
import { BoundExpression } from "./bound.expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundNumericLiteral extends BoundExpression {
  constructor(public value: number, public override span: Span) {
    super(BoundKind.BoundNumericLiteral, span);
  }
}
