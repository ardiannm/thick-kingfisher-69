import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { ExpressionSyntax } from "./expression.syntax";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";
import { SyntaxTree } from "./syntax.tree";

export class CompilationUnit extends SyntaxNode {
  constructor(public override tree: SyntaxTree, public root: Array<ExpressionSyntax>, public eof: SyntaxToken<SyntaxNodeKind.EndOfFileToken>) {
    super(tree, SyntaxNodeKind.CompilationUnit);
  }
}
