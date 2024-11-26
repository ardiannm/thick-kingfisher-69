import { Span } from "../../lexing/span";
import { BoundKind } from "./bound.kind";
import { BoundNode } from "./bound.node";

export class BoundNumericLiteral extends BoundNode {
  constructor(public value: number, public override span: Span) {
    super(BoundKind.BoundNumericLiteral, span);
  }
}
