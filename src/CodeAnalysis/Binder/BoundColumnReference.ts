import { BoundKind } from "./BoundKind";
import { IsReferable } from "./IsReferable";

export class BoundColumnReference extends IsReferable {
  constructor(public override Kind: BoundKind.ColumnReference, public override Name: string) {
    super(Kind, Name);
  }
}
