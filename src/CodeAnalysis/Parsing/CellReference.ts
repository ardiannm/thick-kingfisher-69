import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { SyntaxToken } from "./SyntaxToken";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class CellReference extends ExpressionSyntax {
  constructor(
    public override Kind: SyntaxNodeKind.CellReference,
    public Left: SyntaxToken<SyntaxNodeKind.IdentifierToken>,
    public Right: SyntaxToken<SyntaxNodeKind.NumberToken>
  ) {
    super(Kind);
  }
}
