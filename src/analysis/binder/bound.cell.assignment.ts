import { Cell } from "../../cell";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundNode } from "./bound.node";
import { BoundScope } from "./bound.scope";
import { BoundKind } from "./bound.kind";
import { Span } from "../../lexing/span";

export class DFS {
  private constructor(public node: BoundCellAssignment, public generator: Generator<BoundCellAssignment>) {}

  static createFrom(node: BoundCellAssignment) {
    const generator = (function* (set) {
      for (const item of set) {
        yield item;
      }
    })(node.observers);
    return new DFS(node, generator);
  }
}

export class BoundCellAssignment extends BoundNode {
  constructor(public scope: BoundScope, public reference: Cell, public expression: BoundNode, public dependencies: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);

    console.log();
    console.log("//", this.span.location);
    console.log();

    if (this.scope.assignments.has(this.reference.name)) {
      const existingNode = this.scope.assignments.get(this.reference.name)!;

      existingNode.dependencies.forEach((dependency) => {
        const observers = dependency.assignment.observers;
        // remove the current node from the observers list
        observers.delete(existingNode);
        // if there are no more observers remove the assignment from the scope observers
        if (!observers.size) this.scope.observers.delete(dependency.assignment.reference.name);
      });
    }

    this.dependencies.forEach((node) => node.assignment.observers.add(this));

    this.circularDependency();

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

  circularDependency() {
    const stack = [DFS.createFrom(this)] as DFS[];
    while (stack.length) {
      const node = stack[stack.length - 1];
      const result = node.generator.next();
      if (result.done) {
        stack.pop();
      } else {
        const observer = result.value;
        stack.push(DFS.createFrom(observer));
        if (this.reference.name === observer.reference.name) {
          console.log([this.reference.name, "circularDependency"]);
          console.log(stack.map((n) => n.node.reference.name + "->" + n.node.span.location));
          break;
        }
      }
    }
  }
}

// [ 'A1', 'circularDependency' ]
// [ 'A1', 'A2', 'A3', 'A4', 'A1' ]
