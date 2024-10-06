import { Span } from "../text/span";
import { BoundNode } from "./bound.node";
import { BoundScope } from "./bound.scope";
import { BoundKind } from "./kind/bound.kind";
import { BoundExpression } from "./bound.expression";
import { BoundCellReference } from "./bound.cell.reference";
import { Cell } from "../cell";

export class BoundCellAssignment extends BoundNode {
  constructor(public scope: BoundScope, public reference: Cell, public expression: BoundExpression, public dependencies: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);

    const previous = this.scope.assignments.get(this.reference.name);
    previous?.dependencies.forEach((node) => previous.disconnect(node));

    this.dependencies.forEach((node) => this.connect(node));
    this.scope.assignments.set(this.reference.name, this);
  }

  private connect(node: BoundCellReference) {
    var observers: Set<BoundCellAssignment>;
    if (this.scope.observers.has(node.assignment.reference.name)) {
      observers = this.scope.observers.get(node.assignment.reference.name)!;
    } else {
      observers = new Set<BoundCellAssignment>();
      this.scope.observers.set(node.assignment.reference.name, observers);
    }
    observers.add(this);
  }

  private disconnect(node: BoundCellReference) {
    if (this.scope.observers.has(node.assignment.reference.name)) {
      const observersSet = this.scope.observers.get(node.assignment.reference.name)!;
      observersSet.delete(this);
      if (observersSet.size === 0) this.scope.observers.delete(node.assignment.reference.name);
    }
  }

  count() {
    return this.scope.observers.get(this.reference.name)?.size ?? 0;
  }
}
