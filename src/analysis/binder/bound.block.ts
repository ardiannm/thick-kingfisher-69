import { Span } from "../../lexing/span";
import { BoundNode } from "./bound.node";
import { BoundStatement } from "./bound.statement";
import { BoundKind } from "./kind/bound.kind";

export class BoundBlock extends BoundNode {
  constructor(public statements: Array<BoundStatement>, public override span: Span) {
    super(BoundKind.BoundBlock, span);
  }
}
