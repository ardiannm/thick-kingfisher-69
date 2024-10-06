import { Span } from "../text/span";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";
import { BoundCellAssignment } from "./bound.cell.assignment";

export class BoundCellReference extends BoundNode {
  constructor(public assignment: BoundCellAssignment, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
