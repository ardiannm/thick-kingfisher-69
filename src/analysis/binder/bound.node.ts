import { SyntaxNode } from "../parser/syntax.node";
import { Span } from "../text/span";
import { BoundKind } from "./kind/bound.kind";

export class BoundNode {
  constructor(public kind: BoundKind, public span: Span) {}

  public static create(node: SyntaxNode) {
    return new BoundNode(BoundKind.BoundNoneToken, node.span);
  }
}
