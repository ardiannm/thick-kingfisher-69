import { BoundKind } from "./BoundKind";
import { BoundHasReference } from "./BoundHasReference";

export class BoundCellExpression extends BoundHasReference {
  constructor(public Kind: BoundKind, public Reference: string) {
    super(Kind, Reference);
  }
}
