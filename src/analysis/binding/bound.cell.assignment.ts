import { Cell } from "../../cell";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundNode } from "./bound.node";
import { BoundScope } from "./bound.scope";
import { BoundKind } from "./bound.kind";
import { Span } from "../../lexing/span";
import { Todo } from "../../dev/todo";

@Todo("Continue with storing this node as a new assignment despite any circular dependency detection.")
export class BoundCellAssignment extends BoundNode {
  constructor(public scope: BoundScope, public reference: Cell, public expression: BoundNode, public dependencies: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);

    this.cleanupExistingNode();
    this.registerSelf();

    if (this.checkForCircularDependency()) {
      this.unregisterSelf();
    } else {
      this.storeNewAssignment();
    }
  }

  private cleanupExistingNode() {
    const existingNode = this.scope.assignments.get(this.reference.name);

    if (!existingNode) return;

    existingNode.dependencies.forEach((dependency) => {
      const observers = dependency.assignment.observers;
      observers.delete(existingNode);

      if (!observers.size) {
        this.scope.observers.delete(dependency.assignment.reference.name);
      }
    });
  }

  private registerSelf() {
    this.dependencies.forEach((node) => node.assignment.observers.add(this));
  }

  private unregisterSelf() {
    this.dependencies.forEach((node) => node.assignment.observers.delete(this));
  }

  private storeNewAssignment() {
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

  @Todo("Traverse through dependencies instead of observers to find more than one path to circular dependency.")
  @Todo("Remove node from dependency chain after reporting to prevent infinite loops for proceeding assignments.")
  private checkForCircularDependency() {
    const chain: DependencyLink[] = [DependencyLink.createFrom(this)];

    while (chain.length > 0) {
      const currentNode = chain[chain.length - 1];
      const { done, value: observer } = currentNode.generator.next();

      if (done) {
        chain.pop();
        continue;
      }

      chain.push(DependencyLink.createFrom(observer));

      if (this === observer) {
        this.scope.diagnostics.circularDependencyDetected(this.reference.name, this.span, chain);
        return true;
      }
    }
    return false;
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
