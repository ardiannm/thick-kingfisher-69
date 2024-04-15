import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { StatementSyntax } from "./statement.syntax";

export class FunctionExpression extends StatementSyntax {
  constructor(public override Kind: SyntaxNodeKind.FunctionExpression, public Name: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public Body: Array<StatementSyntax>) {
    super(Kind);
  }
}
