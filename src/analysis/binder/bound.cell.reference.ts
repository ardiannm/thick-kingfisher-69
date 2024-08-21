import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";
import { BoundCell } from "./bound.cell";

export class BoundCellReference extends BoundNode {
  constructor(public cell: BoundCell, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
