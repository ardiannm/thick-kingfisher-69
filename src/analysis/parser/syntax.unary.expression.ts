import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxUnaryOperatorKind } from "./kind/syntax.unary.operator.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxToken } from "./syntax.token";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class SyntaxUnaryExpression extends SyntaxExpression {
  constructor(public override tree: SyntaxTree, public operator: SyntaxToken<SyntaxUnaryOperatorKind>, public right: SyntaxNode) {
    super(tree, SyntaxNodeKind.SyntaxUnaryExpression);
  }
}
