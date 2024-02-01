import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { BinaryOperatorKind } from "./Kind/BinaryOperatorKind";
import { SyntaxNode } from "./SyntaxNode";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { SyntaxToken } from "./SyntaxToken";

export class BinaryExpression extends ExpressionSyntax {
  constructor(
    public override Kind: SyntaxNodeKind.BinaryExpression,
    public Left: SyntaxNode,
    public Operator: SyntaxToken<BinaryOperatorKind>,
    public Right: SyntaxNode
  ) {
    super(Kind);
  }
}
