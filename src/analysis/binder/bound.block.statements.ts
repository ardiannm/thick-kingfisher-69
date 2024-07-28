import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { BoundStatement } from "./statement";

export class BoundBlockStatements extends BoundNode {
  constructor(public members: Array<BoundStatement>) {
    super(BoundKind.BoundBlockStatements);
  }
}
