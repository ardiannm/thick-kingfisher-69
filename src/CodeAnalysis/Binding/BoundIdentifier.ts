import { BoundKind } from "./BoundKind";
import { IsReferable } from "./IsReferable";

export class BoundIdentifier extends IsReferable {
  constructor(public Kind: BoundKind, public Name: string, public Value: string) {
    super(Kind, Name);
  }
}
