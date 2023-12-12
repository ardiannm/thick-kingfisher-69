import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class UnaryExpression extends ExpressionSyntax {
  constructor(public Kind: SyntaxKind, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}
