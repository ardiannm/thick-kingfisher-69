import { BoundCellReference } from "./BoundCellReference";
import { BoundKind } from "./BoundKind";
import { BoundNode } from "./BoundNode";

export class BoundCopyCell extends BoundNode {
  constructor(public Kind: BoundKind, public Left: BoundCellReference, public Right: BoundCellReference) {
    super(Kind);
  }
}
