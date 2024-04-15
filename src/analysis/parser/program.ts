import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class Program extends SyntaxNode {
  constructor(public override Kind: SyntaxNodeKind.Program, public Root: Array<ExpressionSyntax>, public EOF: SyntaxToken<SyntaxNodeKind.EndOfFileToken>) {
    super(Kind);
  }
}
