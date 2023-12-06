import { SyntaxKind } from "./SyntaxKind";
import { Expression } from "./Expression";

export class ReferenceDeclaration extends Expression {
  constructor(public Kind: SyntaxKind, public Left: Expression, public Expression: Expression) {
    super(Kind);
  }
}
