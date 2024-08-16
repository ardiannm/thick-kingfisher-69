import { Span } from "../text/span";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";

export class BoundDefaultZero extends BoundNode {
  constructor(public override span: Span) {
    super(BoundKind.BoundDefaultZero, span);
  }
}
