import { BoundCellAssignment } from "./bound.cell.assignment";
import { BoundNode } from "./bound.node";
import { BoundKind } from "./bound.kind";
import { Span } from "../lexing/span";

export class BoundCellReference extends BoundNode {
  constructor(private _assignment: BoundCellAssignment, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }

  get observers() {
    return this._assignment.generate;
  }

  get name() {
    return this._assignment.store.name;
  }

  get assignment() {
    return this._assignment;
  }
}
