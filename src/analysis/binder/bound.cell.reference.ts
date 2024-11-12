import { TextSpan } from "../../lexing/text.span";
import { BoundCellAssignment } from "./bound.cell.assignment";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellReference extends BoundNode {
  constructor(public assignment: BoundCellAssignment, public override span: TextSpan) {
    super(BoundKind.BoundCellReference, span);
  }
}
