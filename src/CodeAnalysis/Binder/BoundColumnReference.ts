import { BoundKind } from "./BoundKind";
import { IsReferable } from "./IsReferable";

export class BoundColumnReference extends IsReferable {
  constructor(public Kind: BoundKind, public Name: string) {
    super(Kind, Name);
  }
}
