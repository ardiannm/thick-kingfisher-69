import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { UnaryOperatorKind } from "./kind/unary.operator.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxToken } from "./syntax.token";

export class UnaryExpression extends ExpressionSyntax {
  constructor(public override Kind: SyntaxNodeKind.UnaryExpression, public Operator: SyntaxToken<UnaryOperatorKind>, public Right: SyntaxNode) {
    super(Kind);
  }
}
