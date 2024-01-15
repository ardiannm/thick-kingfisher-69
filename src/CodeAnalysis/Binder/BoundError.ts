import { SyntaxNode } from "../Parser/SyntaxNode";
import { BoundKind } from "./Kind/BoundKind";
import { BoundNode } from "./BoundNode";

export class BoundError extends BoundNode {
  constructor(public override Kind: BoundKind.Error, public ErrorAround: SyntaxNode) {
    super(Kind);
  }
}
