import { BoundKind } from "./kind/bound.kind";

export abstract class BoundNode {
  constructor(public kind: BoundKind) {}
}
