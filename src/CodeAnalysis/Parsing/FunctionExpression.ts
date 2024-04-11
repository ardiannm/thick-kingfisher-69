import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { SyntaxToken } from "./SyntaxToken";
import { StatementSyntax } from "./StatementSyntax";

export class FunctionExpression extends StatementSyntax {
  constructor(public override Kind: SyntaxNodeKind.FunctionExpression, public FunctionName: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public BlockScope: Array<ExpressionSyntax>) {
    super(Kind);
  }
}
