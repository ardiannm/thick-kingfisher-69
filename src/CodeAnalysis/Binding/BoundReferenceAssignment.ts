import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundWithReference } from "./BoundWithReference";

export class BoundReferenceAssignment extends BoundWithReference {
  constructor(public Kind: BoundKind, public Reference: string, public Referencing: Array<string>, public ReferencedBy: Array<string>, public Expression: BoundExpression) {
    super(Kind, Reference);
  }

  Subscribe(Reference: string) {
    if (this.ReferencedBy.includes(Reference)) return;
    this.ReferencedBy.push(Reference);
  }
}
