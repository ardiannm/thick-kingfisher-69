import { SyntaxKind } from "./SyntaxKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { SyntaxNode } from "./SyntaxNode";
import { SyntaxToken } from "./SyntaxToken";

export class Program extends SyntaxNode {
  constructor(
    public override Kind: SyntaxKind.Program,
    public Root: Array<ExpressionSyntax>,
    public EOF: SyntaxToken<SyntaxKind.EndOfFileToken>
  ) {
    super(Kind);
  }
}
