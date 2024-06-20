import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxTree } from "./syntax.tree";

export class ParenthesizedExpression extends ExpressionSyntax {
  constructor(public override tree: SyntaxTree, public openParen: SyntaxNode, public expression: SyntaxNode, public closeParen: SyntaxNode) {
    super(tree, SyntaxNodeKind.ParenthesizedExpression);
  }
}
