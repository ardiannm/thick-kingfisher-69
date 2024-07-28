import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { BinaryOperatorKind } from "./kind/binary.operator.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxToken } from "./syntax.token";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class BinaryExpression extends ExpressionSyntax {
  constructor(protected override tree: SyntaxTree, public left: SyntaxNode, public operator: SyntaxToken<BinaryOperatorKind>, public right: SyntaxNode) {
    super(tree, SyntaxNodeKind.BinaryExpression);
  }
}
