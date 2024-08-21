import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxBinaryOperatorKind } from "./kind/syntax.binary.operator.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxToken } from "./syntax.token";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class SyntaxBinaryExpression extends SyntaxExpression {
  constructor(public override tree: SyntaxTree, public left: SyntaxNode, public operator: SyntaxToken<SyntaxBinaryOperatorKind>, public right: SyntaxNode) {
    super(tree, SyntaxNodeKind.BinaryExpression);
  }
}
