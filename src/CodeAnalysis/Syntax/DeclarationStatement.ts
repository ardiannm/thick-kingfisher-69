import { SyntaxKind } from "./SyntaxKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { StatementSyntax } from "./StatementSyntax";
import { SyntaxToken } from "./SyntaxToken";

export class DeclarationStatement extends StatementSyntax {
  constructor(public Kind: SyntaxKind, public Left: ExpressionSyntax, public Keyword: SyntaxToken, public Expression: ExpressionSyntax) {
    super(Kind);
  }
}
