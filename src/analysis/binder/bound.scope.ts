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

  popStack() {
    if (this.stack.length) {
      const observers = this.stack[this.stack.length - 1];
      if (observers.length) {
        return observers[observers.length - 1].reference.name;
      }
    }
    return "";
  }

  clearStack() {
    this.stack.forEach((s) => (s.length = 0));
    this.stack.length = 0;
  }
}
