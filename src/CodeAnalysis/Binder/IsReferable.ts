import { BoundNode } from "./BoundNode";
import { IsReferableKind } from "./IsReferableKind";

export class IsReferable extends BoundNode {
  constructor(public Kind: IsReferableKind, public Name: string) {
    super(Kind);
  }
}
