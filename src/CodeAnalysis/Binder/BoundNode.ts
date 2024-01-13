import { BoundKind } from "./BoundKind";

export abstract class BoundNode {
  constructor(public Kind: BoundKind) {}
}
