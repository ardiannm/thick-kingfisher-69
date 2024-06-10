import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";

export class ParenthesizedExpression extends ExpressionSyntax {
  constructor(public override kind: SyntaxNodeKind.ParenthesizedExpression, public OpenParen: SyntaxNode, public Expression: SyntaxNode, public CloseParen: SyntaxNode) {
    super(kind);
  }
}
