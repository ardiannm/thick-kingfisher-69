import { SyntaxKind } from "./SyntaxKind";
import { Expression } from "./Expression";
import { StatementSyntax } from "./StatementSyntax";

export class DeclarationStatement extends StatementSyntax {
  constructor(public Kind: SyntaxKind, public Left: Expression, public Expression: Expression) {
    super(Kind);
  }
}
