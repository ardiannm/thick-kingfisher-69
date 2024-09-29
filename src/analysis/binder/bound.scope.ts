import { BoundCellAssignment, BoundCellReference } from "../binder";

export class BoundScope {
  assignments = new Map<string, BoundCellAssignment>();
  references = new Array<BoundCellReference>();
  constructor(public parent: BoundScope | null) {}

  clearDependencies() {
    this.assignments.forEach((a) => a.reference.clearDependencies());
  }
}
