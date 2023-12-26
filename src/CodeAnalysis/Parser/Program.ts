import { SyntaxKind } from "./SyntaxKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { SyntaxNode } from "./SyntaxNode";

export class Program extends SyntaxNode {
  constructor(public override Kind: SyntaxKind.Program, public Root: Array<ExpressionSyntax>) {
    super(Kind);
  }
}
