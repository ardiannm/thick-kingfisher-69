import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { UnaryOperatorKind } from "./Kind/UnaryOperatorKind";
import { SyntaxNode } from "./SyntaxNode";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { SyntaxToken } from "./SyntaxToken";

export class UnaryExpression extends ExpressionSyntax {
  constructor(
    public override Kind: SyntaxNodeKind.UnaryExpression,
    public Operator: SyntaxToken<UnaryOperatorKind>,
    public Right: SyntaxNode
  ) {
    super(Kind);
  }
}
