import { SyntaxKind } from "./SyntaxKind";
import { Expression } from "./Expression";
import { StatementSyntax } from "./StatementSyntax";
import { SyntaxToken } from "./SyntaxToken";

export class DeclarationStatement extends StatementSyntax {
  constructor(public Kind: SyntaxKind, public Left: Expression, public Keyword: SyntaxToken, public Expression: Expression) {
    super(Kind);
  }
}
