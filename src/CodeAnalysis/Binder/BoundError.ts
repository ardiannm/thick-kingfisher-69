import { BoundKind } from "./Kind/BoundKind";
import { BoundNode } from "./BoundNode";
import { SyntaxKind } from "../Parser/Kind/SyntaxKind";

export class BoundError extends BoundNode {
  constructor(public override Kind: BoundKind.Error, public NodeKind: SyntaxKind) {
    super(Kind);
  }
}
