import { BoundKind } from "./BoundKind";
import { IsReferable } from "./IsReferable";

export class BoundRowReference extends IsReferable {
  constructor(public override Kind: BoundKind.RowReference, public override Name: string) {
    super(Kind, Name);
  }
}
