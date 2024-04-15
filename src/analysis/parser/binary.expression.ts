import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { BinaryOperatorKind } from "./kind/binary.operator.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxToken } from "./syntax.token";

export class BinaryExpression extends ExpressionSyntax {
  constructor(public override Kind: SyntaxNodeKind.BinaryExpression, public Left: SyntaxNode, public Operator: SyntaxToken<BinaryOperatorKind>, public Right: SyntaxNode) {
    super(Kind);
  }
}
