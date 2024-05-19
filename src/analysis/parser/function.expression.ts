import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { StatementSyntax } from "./statement.syntax";

export class FunctionExpression extends StatementSyntax {
  constructor(public override Kind: SyntaxNodeKind.FunctionExpression, public FunctionName: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public Statements: Array<StatementSyntax>) {
    super(Kind);
  }
}
