import { BoundKind } from "./BoundKind";
import { HasReference } from "./HasReference";

export class BoundIdentifier extends HasReference {
  constructor(public Kind: BoundKind, public Reference: string, public Value: string) {
    super(Kind, Reference);
  }
}
