import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundHasReference } from "./BoundHasReference";

export class BoundReferenceDeclaration extends BoundHasReference {
  constructor(public Kind: BoundKind, public Reference: string, public Referencing: Array<string>, public ReferencedBy: Array<string>, public Expression: BoundExpression) {
    super(Kind, Reference);
  }

  Subscribe(Bound: BoundReferenceDeclaration): void {
    if (this.ReferencedBy.includes(Bound.Reference)) {
      return;
    }
    this.ReferencedBy.push(Bound.Reference);
  }

  Unsubscribe(Bound: BoundReferenceDeclaration): void {
    const Index = this.ReferencedBy.indexOf(Bound.Reference);
    if (Index === -1) return;
    this.ReferencedBy.splice(Index, 1);
  }
}
