import { BoundKind } from "./BoundKind";
import { HasReference } from "./HasReference";

export class BoundNumber extends HasReference {
  constructor(public Kind: BoundKind, public Reference: string, public Value: number) {
    super(Kind, Reference);
  }
}
