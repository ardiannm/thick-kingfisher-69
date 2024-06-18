import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxTree } from "./syntax.tree";

export class RangeReference extends ExpressionSyntax {
  constructor(public override kind: SyntaxNodeKind.RangeReference,
    public override tree: SyntaxTree,
    
    public left: SyntaxNode, public right: SyntaxNode) {
    super(kind, tree);
  }
}
