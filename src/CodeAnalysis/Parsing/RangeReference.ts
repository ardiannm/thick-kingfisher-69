import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { SyntaxNode } from "./SyntaxNode";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class RangeReference extends ExpressionSyntax {
  constructor(public override Kind: SyntaxNodeKind.RangeReference, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}
