import { Span } from "../text/span";
import { BoundKind } from "./kind/bound.kind";
import { BoundNode } from "./bound.node";

export class BoundNone extends BoundNode {
  constructor(public override span: Span) {
    super(BoundKind.BoundNone, span);
  }

  static createFrom(span: Span) {
    return new BoundNone(span);
  }
}
