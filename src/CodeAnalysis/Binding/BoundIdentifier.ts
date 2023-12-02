import { BoundKind } from "./BoundKind";
import { BoundWithReference } from "./BoundWithReference";

export class BoundIdentifier extends BoundWithReference {
  constructor(public Kind: BoundKind, public Reference: string, public Value: number) {
    super(Kind, Reference);
  }
}
