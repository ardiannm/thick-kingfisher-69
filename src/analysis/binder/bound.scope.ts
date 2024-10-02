import { BoundCellAssignment, BoundCellReference } from "../binder";

export class BoundScope {
  observers = new Map<string, Set<BoundCellAssignment>>();
  references = new Array<BoundCellReference>();
  assignments = new Map<string, BoundCellAssignment>();

  stack = new Array<Array<BoundCellAssignment>>();

  constructor(public parent: BoundScope | null) {}

  clearDependencies() {
    this.assignments.forEach((assignment) => (assignment.references.length = 0));
    this.references.length = 0;
  }

  getAssignmentNode(name: string) {
    return this.assignments.get(name)!;
  }
}
