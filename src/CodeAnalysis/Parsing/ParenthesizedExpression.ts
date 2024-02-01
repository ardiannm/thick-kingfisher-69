import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { SyntaxNode } from "./SyntaxNode";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class ParenthesizedExpression extends ExpressionSyntax {
  constructor(
    public override Kind: SyntaxNodeKind.ParenthesizedExpression,
    public OpenParen: SyntaxNode,
    public Expression: SyntaxNode,
    public CloseParen: SyntaxNode
  ) {
    super(Kind);
  }
}
