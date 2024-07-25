import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { StatementSyntax } from "./statement.syntax";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class FunctionExpression extends StatementSyntax {
  constructor(
    public override tree: SyntaxTree,
    public functionName: SyntaxToken<SyntaxNodeKind.IdentifierToken>,
    public openParen: SyntaxToken<SyntaxNodeKind.OpenParenthesisToken>,
    public closeParen: SyntaxToken<SyntaxNodeKind.CloseParenthesisToken>,
    public openBrace: SyntaxToken<SyntaxNodeKind.OpenBraceToken>,
    public statements: Array<StatementSyntax>,
    public closeBrace: SyntaxToken<SyntaxNodeKind.CloseBraceToken>
  ) {
    super(tree, SyntaxNodeKind.FunctionExpression);
  }
}
