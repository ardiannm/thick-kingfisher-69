import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./bound.statement";

export class BoundBlock extends BoundNode {
  constructor(public statements: Array<BoundStatement>) {
    super(BoundKind.BoundBlock);
  }
}
