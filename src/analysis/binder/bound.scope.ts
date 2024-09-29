import { BoundCellAssignment, BoundCellReference } from "../binder";

export class BoundScope {
  observers = new Map<string, Set<BoundCellAssignment>>();
  references = new Array<BoundCellReference>();
  assignments = new Map<string, BoundCellAssignment>();

  constructor(public parent: BoundScope | null) {}

  getGraph(observer: BoundCellAssignment) {
    var observers: Set<BoundCellAssignment>;
    if (this.observers.has(observer.reference.name)) {
      observers = this.observers.get(observer.reference.name)!;
    } else {
      observers = new Set<BoundCellAssignment>();
      this.observers.set(observer.reference.name, observers);
    }
    return observers;
  }

  clearDependencies() {
    this.assignments.forEach((assignment) => (assignment.references.length = 0));
    this.references.length = 0;
  }
}
