import { SyntaxKind } from "./SyntaxKind";
import { Expression } from "./Expression";

export class Declaration extends Expression {
  constructor(public Kind: SyntaxKind, public Left: Expression, public Expression: Expression) {
    super(Kind);
  }
}
