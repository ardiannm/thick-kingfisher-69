import { Cell } from "../../cell";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundNode } from "./bound.node";
import { BoundScope } from "./bound.scope";
import { BoundKind } from "./bound.kind";
import { Span } from "../../lexing/span";

export class BoundCellAssignment extends BoundNode {
  constructor(public scope: BoundScope, public reference: Cell, public expression: BoundNode, public dependencies: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);

    if (this.scope.assignments.has(this.reference.name)) {
      const existingNode = this.scope.assignments.get(this.reference.name)!;

      existingNode.dependencies.forEach((dependency) => {
        const observers = dependency.assignment.observers;
        // remove the current node from the observers list
        observers.delete(existingNode);
        // if there are no more observers remove the set from the scope entirely
        if (!observers.size) this.scope.observers.delete(dependency.assignment.reference.name);
      });
    }

    this.dependencies.forEach((node) => node.assignment.observers.add(this));

    this.checkForCircularDependency();

    this.scope.assignments.set(this.reference.name, this);
  }

  get observers() {
    var observers: Set<BoundCellAssignment>;
    if (this.scope.observers.has(this.reference.name)) {
      observers = this.scope.observers.get(this.reference.name)!;
    } else {
      observers = new Set<BoundCellAssignment>();
      this.scope.observers.set(this.reference.name, observers);
    }
    return observers;
  }

  checkForCircularDependency() {
    const chain: DependencyLink[] = [DependencyLink.createFrom(this)];

    while (chain.length > 0) {
      const currentNode = chain[chain.length - 1];
      const { done, value: observer } = currentNode.generator.next();

      if (done) {
        chain.pop();
        continue;
      }

      chain.push(DependencyLink.createFrom(observer));

      if (this.reference.name === observer.reference.name) {
        this.scope.diagnostics.circularDependencyDetected(this.reference.name, this.span, chain);
        break;
      }
    }
  }
}

export class DependencyLink {
  private constructor(public node: BoundCellAssignment, public generator: Generator<BoundCellAssignment>) {}

  static createFrom(node: BoundCellAssignment) {
    const generator = (function* (set) {
      for (const item of set) {
        yield item;
      }
    })(node.observers);
    return new DependencyLink(node, generator);
  }
}
