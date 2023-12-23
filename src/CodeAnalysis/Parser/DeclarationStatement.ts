import { SyntaxKind } from "./SyntaxKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { StatementSyntax } from "./StatementSyntax";
import { SyntaxToken } from "./SyntaxToken";

export class DeclarationStatement extends StatementSyntax {
  constructor(
    public Kind: SyntaxKind.ReferenceCell | SyntaxKind.CloneCell,
    public Left: ExpressionSyntax,
    public Keyword: SyntaxToken<SyntaxKind>,
    public Expression: ExpressionSyntax
  ) {
    super(Kind);
  }
}
