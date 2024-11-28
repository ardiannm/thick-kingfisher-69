import { BoundCellAssignment } from "./bound.cell.assignment";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./bound.kind";
import { Span } from "../../lexing/span";

export class BoundCellReference extends BoundNode {
  constructor(private assignment: BoundCellAssignment, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }

  get observers() {
    return this.assignment.observers;
  }

  get name() {
    return this.assignment.reference.name;
  }

  get value() {
    return this.assignment.reference.value;
  }
}
