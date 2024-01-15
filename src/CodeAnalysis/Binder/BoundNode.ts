import { BoundKind } from "./Kind/BoundKind";

export abstract class BoundNode {
  constructor(public Kind: BoundKind) {}
}
