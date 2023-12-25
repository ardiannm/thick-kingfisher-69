import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class BinaryExpression extends ExpressionSyntax {
  constructor(
    public override Kind: SyntaxKind.BinaryExpression,
    public Left: SyntaxNode,
    public Operator: SyntaxNode,
    public Right: SyntaxNode
  ) {
    super(Kind);
  }
}
