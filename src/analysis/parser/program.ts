import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class Program extends SyntaxNode {
  constructor(public override kind: SyntaxNodeKind.Program, public root: Array<ExpressionSyntax>, public eof: SyntaxToken<SyntaxNodeKind.EndOfFileToken>) {
    super(kind);
  }
}
