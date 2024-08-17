import { Span } from "../text/span";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";

export class BoundDefaultZero extends BoundNode {
  private constructor(public override span: Span) {
    super(BoundKind.BoundDefaultZero, span);
  }

  static createFrom(span: Span) {
    return new BoundDefaultZero(span);
  }
}
