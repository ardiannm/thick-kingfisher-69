import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundWithReference } from "./BoundWithReference";

export class BoundReferenceDeclaration extends BoundWithReference {
  constructor(public Kind: BoundKind, public Reference: string, public Referencing: Array<string>, public ReferencedBy: Array<string>, public Expression: BoundExpression) {
    super(Kind, Reference);
  }

  Subscribe(Bound: BoundReferenceDeclaration) {
    console.log(`'${Bound.Reference}' Subscribe To '${this.Reference}'`);
    this.ReferencedBy.push(Bound.Reference);
  }

  Unsubscribe(Bound: BoundReferenceDeclaration) {
    console.log(`'${Bound.Reference}' Unsubscribe From '${this.Reference}'`);
    this.ReferencedBy = this.ReferencedBy.filter((Subscriber) => Subscriber !== Bound.Reference);
  }
}
