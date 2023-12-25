import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { ExpressionSyntax } from "./ExpressionSyntax";

export class RangeReference extends ExpressionSyntax {
  constructor(public override Kind: SyntaxKind.RangeReference, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}
