import { SyntaxTree } from "../../syntax.tree";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxUnaryOperatorKind } from "./kind/syntax.unary.operator.kind";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxUnaryExpression extends SyntaxExpression {
  constructor(public override tree: SyntaxTree, public operator: SyntaxToken<SyntaxUnaryOperatorKind>, public right: SyntaxNode) {
    super(tree, SyntaxNodeKind.SyntaxUnaryExpression);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.operator;
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.right.getLastChild();
  }
}
