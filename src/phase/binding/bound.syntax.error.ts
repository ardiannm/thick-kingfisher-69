import { BoundNode } from "./bound.node"
import { BoundKind } from "./bound.kind"
import { Span } from "../lexing/span"
import { SyntaxKind } from "../parsing/syntax.kind"

export class BoundSyntaxError<K extends SyntaxKind = SyntaxKind> extends BoundNode {
  constructor(public nodeKind: K, public override span: Span) {
    super(BoundKind.BoundSyntaxError, span)
  }
}
