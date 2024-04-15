import { BoundExpression } from "./analysis/binder/expression";
import { BoundKind } from "./analysis/binder/kind/bound.kind";
import { BoundNode } from "./analysis/binder/bound.node";

export class Cell extends BoundNode {
  constructor(
    public override Kind: BoundKind.Cell,
    public Name: string,
    public Declared: boolean,
    public Value: number,
    public Expression: BoundExpression,
    public Dependencies: Map<string, Cell>,
    public Subscribers: Map<string, Cell>,
    public Formula: string,
    public Row: number,
    public Column: number
  ) {
    super(Kind);
  }

  Track(Dependency: Cell) {
    this.Dependencies.set(Dependency.Name, Dependency);
    Dependency.Subscribers.set(this.Name, this);
  }

  Contains(Dependency: Cell, Visited = new Set()) {
    if (Visited.has(this)) return false;
    Visited.add(this);
    if (this.Dependencies.has(Dependency.Name)) return true;
    for (const Dep of this.Dependencies.values()) if (Dep.Contains(Dependency, Visited)) return true;
    return false;
  }

  ClearDependencies() {
    this.Dependencies.forEach((Dependency) => Dependency.Subscribers.delete(this.Name));
    this.Dependencies.clear();
  }
}
