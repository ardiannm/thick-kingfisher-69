import { TextSpan } from "../../lexing/text.span";
import { Kind } from "../parsing/syntax.kind";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./bound.kind";

export class BoundErrorExpression extends BoundNode {
  constructor(public nodeKind: Kind, public override span: TextSpan) {
    super(BoundKind.BoundErrorExpression, span);
  }
}
