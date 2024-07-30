import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxExpression } from "./syntax.expression";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class SyntaxRangeReference extends SyntaxExpression {
  constructor(protected override tree: SyntaxTree, public left: SyntaxNode, public right: SyntaxNode) {
    super(tree, SyntaxNodeKind.SyntaxRangeReference);
  }
}
