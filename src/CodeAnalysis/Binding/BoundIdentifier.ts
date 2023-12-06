import { BoundKind } from "./BoundKind";
import { BoundHasReference } from "./BoundHasReference";

export class BoundIdentifier extends BoundHasReference {
  constructor(public Kind: BoundKind, public Reference: string, public Value: string) {
    super(Kind, Reference);
  }
}
