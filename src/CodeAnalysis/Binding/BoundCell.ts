import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundNode } from "./BoundNode";

export class BoundCell extends BoundNode {
  constructor(public Kind: BoundKind, public Name: string, public Value: number, public Expression: BoundExpression, public Dependencies: Set<string>, public Dependents: Set<string>) {
    super(Kind);
  }

  public Notify(Bound: BoundCell): void {
    this.Dependents.add(Bound.Name);
  }

  public DoNoNotify(Bound: BoundCell): void {
    this.Dependents.delete(Bound.Name);
  }
}
