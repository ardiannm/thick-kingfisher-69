import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";
import { SyntaxTree } from "../../runtime/syntax.tree";
import { SyntaxStatement } from "./sytax.statements";
import { Span } from "../text/span";

export class SyntaxCompilationUnit extends SyntaxNode {
  constructor(public override tree: SyntaxTree, public root: Array<SyntaxStatement>, public eof: SyntaxToken<SyntaxNodeKind.EndOfFileToken>) {
    super(tree, SyntaxNodeKind.SyntaxCompilationUnit);
  }

  static createFrom(tree: SyntaxTree) {
    return new SyntaxCompilationUnit(tree, [], new SyntaxToken<SyntaxNodeKind.EndOfFileToken>(tree, SyntaxNodeKind.EndOfFileToken, Span.createFrom(tree.text, 0, 1)));
  }
}
