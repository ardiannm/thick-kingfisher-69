import { Kind } from "../parsing/syntax.kind";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./bound.kind";
import { Span } from "../lexing/span";

export class BoundSyntaxError extends BoundNode {
  constructor(public nodeKind: Kind, public override span: Span) {
    super(BoundKind.BoundSyntaxError, span);
  }
}
