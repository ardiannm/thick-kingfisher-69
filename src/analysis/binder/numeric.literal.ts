import { BoundExpression } from "./expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundNumericLiteral extends BoundExpression {
  constructor(public value: number) {
    super(BoundKind.NumericLiteral);
  }
}
