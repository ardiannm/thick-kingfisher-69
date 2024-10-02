import { BoundCellAssignment, BoundCellReference } from "../binder";

export class BoundScope {
  observers = new Map<string, Set<BoundCellAssignment>>();
  references = new Array<BoundCellReference>();
  assignments = new Map<string, BoundCellAssignment>();

  stack = new Array<Array<BoundCellAssignment>>();

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

  stackNode(name: string) {
    if (this.observers.has(name)) {
      const observers = this.observers.get(name)!;
      const stack = new Array<BoundCellAssignment>();
      observers.forEach((o) => stack.push(o));
      this.stack.push(stack);
    }
    if (this.stack.length === 0) this.stack.push([]);
    return this.stack;
  }
}
