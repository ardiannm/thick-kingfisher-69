import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundHasReference } from "./BoundHasReference";

export class BoundDeclaration extends BoundHasReference {
  constructor(public Kind: BoundKind, public Reference: string, public Dependencies: Set<string>, public Dependents: Set<string>, public Expression: BoundExpression) {
    super(Kind, Reference);
  }

  Notify(Bound: BoundDeclaration): void {
    this.Dependents.add(Bound.Reference);
  }

  DoNoNotify(Bound: BoundDeclaration): void {
    this.Dependents.delete(Bound.Reference);
  }
}
