import { BoundKind } from "./BoundKind";
import { BoundHasReference } from "./BoundHasReference";

export class BoundNumber extends BoundHasReference {
  constructor(public Kind: BoundKind, public Reference: string, public Value: number) {
    super(Kind, Reference);
  }
}
