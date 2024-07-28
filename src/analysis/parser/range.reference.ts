import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class RangeReference extends ExpressionSyntax {
  constructor(protected override tree: SyntaxTree, public left: SyntaxNode, public right: SyntaxNode) {
    super(tree, SyntaxNodeKind.RangeReference);
  }
}
