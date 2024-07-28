import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";
import { SyntaxTree } from "../../runtime/syntax.tree";
import { BlockStatements } from "./block.statement";

export class CompilationUnit extends SyntaxNode {
  constructor(protected override tree: SyntaxTree, public root: BlockStatements, public eof: SyntaxToken<SyntaxNodeKind.EndOfFileToken>) {
    super(tree, SyntaxNodeKind.CompilationUnit);
  }
}
