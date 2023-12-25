import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class CellReference extends ExpressionSyntax {
  constructor(
    public override Kind: SyntaxKind.CellReference,
    public Left: SyntaxToken<SyntaxKind.IdentifierToken>,
    public Right: SyntaxToken<SyntaxKind.NumberToken>
  ) {
    super(Kind);
  }
}
