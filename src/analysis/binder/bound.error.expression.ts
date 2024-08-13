import { BoundKind } from "./kind/bound.kind";
import { BoundNode } from "./bound.node";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { Span } from "../text/span";

export class BoundErrorExpression extends BoundNode {
  constructor(public nodeKind: SyntaxKind, public override span: Span) {
    super(BoundKind.BoundErrorExpression, span);
  }
}
