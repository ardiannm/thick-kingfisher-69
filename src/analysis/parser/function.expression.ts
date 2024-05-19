import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { StatementSyntax } from "./statement.syntax";

export class FunctionExpression extends StatementSyntax {
  constructor(
    public override Kind: SyntaxNodeKind.FunctionExpression,
    public FunctionName: SyntaxToken<SyntaxNodeKind.IdentifierToken>,
    public OpenParen: SyntaxToken<SyntaxNodeKind.OpenParenthesisToken>,
    public CloseParen: SyntaxToken<SyntaxNodeKind.CloseParenthesisToken>,
    public OpenBrace: SyntaxToken<SyntaxNodeKind.OpenBraceToken>,
    public Statements: Array<StatementSyntax>,
    public CloseBrace: SyntaxToken<SyntaxNodeKind.CloseBraceToken>
  ) {
    super(Kind);
  }
}
