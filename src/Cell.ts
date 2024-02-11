import { BoundExpression } from "./CodeAnalysis/Binding/BoundExpression";
import { BoundKind } from "./CodeAnalysis/Binding/Kind/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";

export class Cell extends BoundNode {
  constructor(
    public override Kind: BoundKind.Cell,
    public Name: string,
    public Declared: boolean,
    public Value: number,
    public Expression: BoundExpression,
    public Dependencies: Map<string, Cell>,
    public Subscribers: Map<string, Cell>,
    public Formula: string
  ) {
    super(Kind);
  }

  Track(Dependency: Cell) {
    this.Dependencies.set(Dependency.Name, Dependency);
    Dependency.Subscribers.set(this.Name, this);
  }

  Contains(Dependency: Cell) {
    if (this.Dependencies.has(Dependency.Name)) return true;
    for (const Dep of this.Dependencies.values()) if (Dep.Contains(Dependency)) return true;
    return false;
  }

  ClearDependencies() {
    this.Dependencies.forEach((Dependency) => Dependency.Subscribers.delete(this.Name));
    this.Dependencies.clear();
  }
}
