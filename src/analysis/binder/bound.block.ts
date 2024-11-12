import { TextSpan } from "../../lexing/text.span";
import { BoundNode } from "./bound.node";
import { BoundStatement } from "./bound.statement";
import { BoundKind } from "./kind/bound.kind";

export class BoundBlock extends BoundNode {
  constructor(public statements: Array<BoundStatement>, public override span: TextSpan) {
    super(BoundKind.BoundBlock, span);
  }
}
