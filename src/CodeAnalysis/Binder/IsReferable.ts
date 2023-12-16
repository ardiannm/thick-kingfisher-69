import { BoundKind } from "./BoundKind";
import { BoundNode } from "./BoundNode";

export class IsReferable extends BoundNode {
  constructor(public Kind: BoundKind, public Name: string) {
    super(Kind);
  }
}
