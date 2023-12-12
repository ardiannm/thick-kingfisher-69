import { BoundKind } from "./BoundKind";
import { BoundNode } from "./BoundNode";
import { BoundExpression } from "./BoundExpression";

export class BoundRoot extends BoundNode {
  constructor(public Kind: BoundKind, public Expressions: Array<BoundExpression>) {
    super(Kind);
  }
}
