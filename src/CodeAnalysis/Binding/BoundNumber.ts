import { BoundKind } from "./BoundKind";
import { BoundNode } from "./BoundNode";

export class BoundNumber extends BoundNode {
  constructor(public Kind: BoundKind, public Value: number) {
    super(Kind);
  }
}
