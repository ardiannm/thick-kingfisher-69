import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";

export class BoundCellReference extends BoundNode {
  constructor(public name: string, public declared: boolean, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
