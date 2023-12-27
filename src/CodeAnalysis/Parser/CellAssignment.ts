import { SyntaxKind } from "./SyntaxKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { StatementSyntax } from "./StatementSyntax";
import { SyntaxToken } from "./SyntaxToken";

export class CellAssignment extends StatementSyntax {
  constructor(
    public override Kind: SyntaxKind.CellAssignment,
    public Left: ExpressionSyntax,
    public Keyword: SyntaxToken<SyntaxKind.GreaterGreaterToken>,
    public Expression: ExpressionSyntax
  ) {
    super(Kind);
  }
}
