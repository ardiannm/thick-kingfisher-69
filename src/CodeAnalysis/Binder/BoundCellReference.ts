import { BoundKind } from "./BoundKind";
import { IsReferable } from "./IsReferable";

export class BoundCellReference extends IsReferable {
  constructor(public override Kind: BoundKind.CellReference, public override Name: string) {
    super(Kind, Name);
  }
}
