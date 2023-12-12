import { BoundKind } from "./BoundKind";
import { IsReferable } from "./IsReferable";

export class BoundNumber extends IsReferable {
  constructor(public Kind: BoundKind, public Name: string, public Value: number) {
    super(Kind, Name);
  }
}
