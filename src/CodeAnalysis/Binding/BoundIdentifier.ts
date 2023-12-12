import { BoundKind } from "./BoundKind";
import { HasReference } from "./HasReference";

export class BoundIdentifier extends HasReference {
  constructor(public Kind: BoundKind, public Name: string, public Value: string) {
    super(Kind, Name);
  }
}
