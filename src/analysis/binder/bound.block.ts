import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./bound.statement";
import { Span } from "../text/span";

export class BoundBlock extends BoundNode {
  constructor(public statements: Array<BoundStatement>, public override span: Span) {
    super(BoundKind.BoundBlock, span);
  }
}
