import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class CellReference extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Left: SyntaxToken, public Right: SyntaxToken) {
    super(Kind);
  }
}
