import { SyntaxKind } from "./SyntaxKind";
import { Expression } from "./Expression";
import { SyntaxToken } from "./SyntaxToken";

export class ReferenceDeclaration extends Expression {
  constructor(public Kind: SyntaxKind, public Left: Expression, public Pointer: SyntaxToken, public Expression: Expression) {
    super(Kind);
  }
}
