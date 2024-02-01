import { BoundKind } from "./Kind/BoundKind";
import { BoundNode } from "./BoundNode";
import { SyntaxKind } from "../Parsing/Kind/SyntaxKind";

export class BoundError extends BoundNode {
  constructor(public override Kind: BoundKind.Error, public NodeKind: SyntaxKind) {
    super(Kind);
  }
}
