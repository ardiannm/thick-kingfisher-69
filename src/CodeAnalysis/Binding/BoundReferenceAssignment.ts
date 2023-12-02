import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundWithReference } from "./BoundWithReference";

export class BoundReferenceAssignment extends BoundWithReference {
  constructor(public Kind: BoundKind, public Reference: string, public Referencing: Array<string>, public ReferencedBy: Array<BoundReferenceAssignment>, public Expression: BoundExpression) {
    super(Kind, Reference);
  }

  Subscribe(Bound: BoundReferenceAssignment) {
    for (const Subscriber of this.ReferencedBy) {
      if (Subscriber.Reference === Bound.Reference) return;
    }
    this.ReferencedBy.push(Bound);
  }

  UnSubscribe(Bound: BoundReferenceAssignment) {
    this.ReferencedBy = this.ReferencedBy.filter((Subscriber) => Subscriber.Reference !== Bound.Reference);
  }
}
