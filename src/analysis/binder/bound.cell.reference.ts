import { BoundNode } from "./bound.node";
import { BoundCell } from "./bound.cell";
import { BoundKind } from "./kind/bound.kind";
import { Span } from "../text/span";

export class BoundCellReference extends BoundNode {
  constructor(public reference: BoundCell, public span: Span) {
    super(BoundKind.BoundCellReference);
  }
}
