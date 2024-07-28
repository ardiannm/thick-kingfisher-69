import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { UnaryOperatorKind } from "./kind/unary.operator.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxToken } from "./syntax.token";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class UnaryExpression extends ExpressionSyntax {
  constructor(protected override tree: SyntaxTree, public operator: SyntaxToken<UnaryOperatorKind>, public right: SyntaxNode) {
    super(tree, SyntaxNodeKind.UnaryExpression);
  }
}
