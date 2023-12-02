import { BoundKind } from "./BoundKind";
import { BoundWithReference } from "./BoundWithReference";

export class BoundCellReference extends BoundWithReference {
  constructor(public Kind: BoundKind, public Reference: string) {
    super(Kind, Reference);
  }
}
