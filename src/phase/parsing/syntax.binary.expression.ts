import { SyntaxBinaryOperatorKind, SyntaxKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "../lexing/syntax.token";

export class SyntaxBinaryExpression extends SyntaxNode {
  constructor(public left: SyntaxNode, public operator: SyntaxToken<SyntaxBinaryOperatorKind>, public right: SyntaxNode) {
    super(operator.source, SyntaxKind.SyntaxBinaryExpression);
  }

  override getFirstChild(): SyntaxToken {
    return this.left.getFirstChild();
  }
  override getLastChild(): SyntaxToken {
    return this.right.getLastChild();
  }
}
