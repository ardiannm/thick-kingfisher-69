import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundHasReference } from "./BoundHasReference";

export class BoundReferenceDeclaration extends BoundHasReference {
  constructor(public Kind: BoundKind, public Reference: string, public Referencing: Set<string>, public ReferencedBy: Set<string>, public Expression: BoundExpression) {
    super(Kind, Reference);
  }

  Observe(Bound: BoundReferenceDeclaration): void {
    this.ReferencedBy.add(Bound.Reference);
  }

  DoNotObserve(Bound: BoundReferenceDeclaration): void {
    this.ReferencedBy.delete(Bound.Reference);
  }
}
