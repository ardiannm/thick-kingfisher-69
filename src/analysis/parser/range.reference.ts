import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { ExpressionSyntax } from "./expression.syntax";

export class RangeReference extends ExpressionSyntax {
  constructor(public override Kind: SyntaxNodeKind.RangeReference, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}
