import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class ParenthesizedExpression extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public OpenParen: SyntaxNode, public Expression: SyntaxNode, public CloseParen: SyntaxNode) {
    super(Kind);
  }
}
