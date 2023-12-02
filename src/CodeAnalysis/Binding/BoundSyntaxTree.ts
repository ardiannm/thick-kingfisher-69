import { BoundKind } from "./BoundKind";
import { BoundNode } from "./BoundNode";
import { BoundExpression } from "./BoundExpression";

export class BoundSyntaxTree extends BoundNode {
  constructor(public Kind: BoundKind, public Root: Array<BoundExpression>) {
    super(Kind);
  }
}
