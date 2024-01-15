import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { ExpressionSyntax } from "./ExpressionSyntax";
import { SyntaxNode } from "./SyntaxNode";
import { SyntaxToken } from "./SyntaxToken";

export class Program extends SyntaxNode {
  constructor(
    public override Kind: SyntaxNodeKind.Program,
    public Root: Array<ExpressionSyntax>,
    public EOF: SyntaxToken<SyntaxNodeKind.EndOfFileToken>
  ) {
    super(Kind);
  }
}
