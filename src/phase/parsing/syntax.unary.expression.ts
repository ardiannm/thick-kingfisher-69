import { SyntaxKind, SyntaxUnaryOperatorKind } from "./syntax.kind"
import { SyntaxNode } from "./syntax.node"
import { SyntaxToken } from "../lexing/syntax.token"

export class SyntaxUnaryExpression<Operator extends SyntaxToken<SyntaxUnaryOperatorKind> = SyntaxToken<SyntaxUnaryOperatorKind>, Right extends SyntaxNode = SyntaxNode> extends SyntaxNode {
  constructor(public operator: Operator, public right: Right) {
    super(operator.source, SyntaxKind.SyntaxUnaryExpression)
  }

  override getFirstChild(): SyntaxToken<SyntaxUnaryOperatorKind> {
    return this.operator
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.right.getLastChild()
  }
}
