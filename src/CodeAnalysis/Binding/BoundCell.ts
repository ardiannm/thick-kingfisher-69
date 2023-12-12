import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { IsReferable } from "./IsReferable";

export class BoundCell extends IsReferable {
  constructor(public Kind: BoundKind, public Name: string, public Dependencies: Set<string>, public Dependents: Set<string>, public Expression: BoundExpression) {
    super(Kind, Name);
  }

  Notify(Bound: BoundCell): void {
    this.Dependents.add(Bound.Name);
  }

  DoNoNotify(Bound: BoundCell): void {
    this.Dependents.delete(Bound.Name);
  }
}
