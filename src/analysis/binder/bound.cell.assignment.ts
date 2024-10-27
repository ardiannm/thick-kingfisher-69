import { Cell } from "../../cell";
import { Span } from "../../lexing/span";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundExpression } from "./bound.expression";
import { BoundNode } from "./bound.node";
import { BoundScope } from "./bound.scope";
import { BoundKind } from "./kind/bound.kind";

export class BoundCellAssignment extends BoundNode {
  constructor(public scope: BoundScope, public reference: Cell, public expression: BoundExpression, public dependencies: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);

    // TODO: track and report the path to circular dependency
    
    if (this.scope.assignments.has(this.reference.name)) {
      const existingNode = this.scope.assignments.get(this.reference.name)!;

      existingNode.dependencies.forEach((dependency) => {
        const observers = dependency.assignment.observers();

        // remove the current node from the observers list
        observers.delete(existingNode);

        // if there are no more observers remove the assignment from the scope observers
        if (observers.size === 0) {
          this.scope.observers.delete(dependency.assignment.reference.name);
        }
      });
    }

    this.dependencies.forEach((node) => node.assignment.observers().add(this));
    this.scope.assignments.set(this.reference.name, this);
  }

  observers() {
    var observers: Set<BoundCellAssignment>;
    if (this.scope.observers.has(this.reference.name)) {
      observers = this.scope.observers.get(this.reference.name)!;
    } else {
      observers = new Set<BoundCellAssignment>();
      this.scope.observers.set(this.reference.name, observers);
    }
    return observers;
  }
}
