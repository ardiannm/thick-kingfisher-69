import { BoundExpression } from "./BoundExpression";
import { BoundKind } from "./BoundKind";
import { BoundHasReference } from "./BoundHasReference";

export class BoundReferenceDeclaration extends BoundHasReference {
  constructor(public Kind: BoundKind, public Reference: string, public Referencing: Array<string>, public ReferencedBy: Array<string>, public Expression: BoundExpression) {
    super(Kind, Reference);
  }

  Subscribe(Bound: BoundReferenceDeclaration): void {
    console.log(`'${Bound.Reference}' Subscribe To '${this.Reference}'`);
    this.ReferencedBy.push(Bound.Reference);
  }

  Unsubscribe(Bound: BoundReferenceDeclaration): void {
    const index = this.ReferencedBy.indexOf(Bound.Reference);
    if (index !== -1) {
      console.log(`'${Bound.Reference}' Unsubscribe From '${this.Reference}'`);
      this.ReferencedBy.splice(index, 1);
    }
  }
}
