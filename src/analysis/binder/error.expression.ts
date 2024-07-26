import { BoundKind } from "./kind/bound.kind";
import { BoundNode } from "./bound.node";
import { SyntaxKind } from "../parser/kind/syntax.kind";

export class BoundErrorExpression extends BoundNode {
  constructor(public nodeKind: SyntaxKind) {
    super(BoundKind.ErrorExpression);
  }
}
