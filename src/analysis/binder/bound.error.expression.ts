import { Span } from "../../lexing/span";
import { SyntaxKind } from "../parsing/kind/syntax.kind";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";

export class BoundErrorExpression extends BoundNode {
  constructor(public nodeKind: SyntaxKind, public override span: Span) {
    super(BoundKind.BoundErrorExpression, span);
  }
}
