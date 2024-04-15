import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { ExpressionSyntax } from "./expression.syntax";

export class CellReference extends ExpressionSyntax {
  constructor(public override Kind: SyntaxNodeKind.CellReference, public Left: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public Right: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    super(Kind);
  }
}
