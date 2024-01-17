import { BoundKind } from "./Kind/BoundKind";
import { BoundNode } from "./BoundNode";

export class BoundError extends BoundNode {
  constructor(public override Kind: BoundKind.Error) {
    super(Kind);
  }
}
