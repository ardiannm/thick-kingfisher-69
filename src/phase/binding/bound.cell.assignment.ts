import { Cell } from "../../cell";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundNode } from "./bound.node";
import { BoundScope } from "./bound.scope";
import { BoundKind } from "./bound.kind";
import { Span } from "../lexing/span";

export class BoundCellAssignment extends BoundNode {
  public observers?: Array<BoundCellAssignment>;
  constructor(public scope: BoundScope, public store: Cell, public expression: BoundNode, public dependencies: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);

    this.cleanupExistingNode();
    this.registerSelf();

    if (this.noCircularDependency()) {
      this.storeAssignment();
    }
  }

  private cleanupExistingNode(): void {
    const existingNode = this.scope.assignments.get(this.store.name);
    if (!existingNode) return;
    for (const dependency of existingNode.dependencies) {
      const observers = dependency.observers;
      observers.delete(existingNode);
      if (observers.size === 0) this.scope.observers.delete(dependency.name);
    }
  }

  private registerSelf() {
    this.dependencies.forEach((node) => node.observers.add(this));
  }

  private storeAssignment() {
    this.scope.assignments.set(this.store.name, this);
    const obs = this.generate;
    if (obs.size) {
      this.observers = [];
      obs.forEach((o) => this.observers?.push(o));
    }
  }

  get generate() {
    var observers: Set<BoundCellAssignment>;
    if (this.scope.observers.has(this.store.name)) {
      observers = this.scope.observers.get(this.store.name)!;
    } else {
      observers = new Set<BoundCellAssignment>();
      this.scope.observers.set(this.store.name, observers);
    }
    return observers;
  }

  private noCircularDependency() {
    let index = 0;
    let correct = true;
    const chain = [DependencyLink.createFrom(this)];
    while (chain.length) {
      const { done, dependency } = chain[chain.length - 1].next();
      if (done) {
        chain.pop();
      } else {
        const node = DependencyLink.createFrom(dependency.assignment);
        chain.push(node);
        if (this.store.name === dependency.name) {
          this.scope.diagnostics.reportCircularDependencyDetected(this.dependencies[index].span, chain);
          chain.length = 1;
          correct = false;
        }
      }
      if (chain.length === 1) {
        index++;
      }
    }
    return correct;
  }
}

export class DependencyLink {
  private constructor(public node: BoundCellAssignment, private generator: Generator<BoundCellReference>) {}

  static createFrom(node: BoundCellAssignment) {
    const generator = (function* (set) {
      for (const item of set) {
        yield item;
      }
    })(node.dependencies);
    return new DependencyLink(node, generator);
  }

  next() {
    const { done, value: dependency } = this.generator.next();
    return { done, dependency };
  }
}
