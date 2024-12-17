import { BoundCellAssignment } from "./bound.cell.assignment";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./bound.kind";
import { Span } from "../lexing/span";

export class BoundCellReference extends BoundNode {
  constructor(private _assignment: BoundCellAssignment, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }

  get observers() {
    return this._assignment.observers;
  }

  get name() {
    return this._assignment.reference.name;
  }

  get value() {
    return this._assignment.reference.value;
  }

  get assignment() {
    return this._assignment;
  }
}
