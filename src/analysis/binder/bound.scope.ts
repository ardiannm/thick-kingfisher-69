import { BoundCellAssignment, BoundCellReference } from "../binder";

export class BoundScope {
  assignments = new Map<string, BoundCellAssignment>();
  references = new Array<BoundCellReference>();
  constructor(public parent: BoundScope | null) {}

  report() {
    return [...this.assignments.values()].map((a) => a.report());
  }
}
