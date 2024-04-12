import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { SyntaxToken } from "./SyntaxToken";
import { StatementSyntax } from "./StatementSyntax";

export class FunctionExpression extends StatementSyntax {
  constructor(public override Kind: SyntaxNodeKind.FunctionExpression, public Name: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public Body: Array<StatementSyntax>) {
    super(Kind);
  }
}
