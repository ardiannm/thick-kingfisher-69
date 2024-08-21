import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class SyntaxParenthesis extends SyntaxExpression {
  constructor(public override tree: SyntaxTree, public openParen: SyntaxNode, public expression: SyntaxNode, public closeParen: SyntaxNode) {
    super(tree, SyntaxNodeKind.SyntaxParenthesis);
  }
}
