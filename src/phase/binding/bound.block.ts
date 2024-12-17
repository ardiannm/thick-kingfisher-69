import { BoundNode } from "./bound.node";
import { BoundKind } from "./bound.kind";
import { Span } from "../lexing/span";

export class BoundBlock extends BoundNode {
  constructor(public statements: Array<BoundNode>, public override span: Span) {
    super(BoundKind.BoundBlock, span);
  }
}
