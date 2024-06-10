import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxToken } from "./syntax.token";
import { ExpressionSyntax } from "./expression.syntax";

export class CellReference extends ExpressionSyntax {
  constructor(public override kind: SyntaxNodeKind.CellReference, public left: SyntaxToken<SyntaxNodeKind.IdentifierToken>, public right: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    super(kind);
  }
}
