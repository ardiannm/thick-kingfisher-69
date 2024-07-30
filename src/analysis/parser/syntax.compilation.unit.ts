import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";
import { SyntaxTree } from "../../runtime/syntax.tree";
import { SyntaxStatement } from "./sytax.statements";

export class SyntaxCompilationUnit extends SyntaxNode {
  constructor(protected override tree: SyntaxTree, public root: Array<SyntaxStatement>, public eof: SyntaxToken<SyntaxNodeKind.EndOfFileToken>) {
    super(tree, SyntaxNodeKind.SyntaxCompilationUnit);
  }
}
