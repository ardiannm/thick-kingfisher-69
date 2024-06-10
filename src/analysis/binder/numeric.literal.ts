import { BoundExpression } from "./expression";
import { BoundKind } from "./kind/bound.kind";

export class BoundNumericLiteral extends BoundExpression {
  constructor(public override kind: BoundKind.NumericLiteral, public value: number) {
    super(kind);
  }
}
