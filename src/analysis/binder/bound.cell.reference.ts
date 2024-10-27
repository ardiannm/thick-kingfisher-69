import { Span } from "../../lexing/span";
import { BoundCellAssignment } from "./bound.cell.assignment";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellReference extends BoundNode {
  constructor(public assignment: BoundCellAssignment, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}
