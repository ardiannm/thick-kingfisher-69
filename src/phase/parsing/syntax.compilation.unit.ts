import { Kind, SyntaxKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "../lexing/syntax.token";

export class SyntaxCompilationUnit extends SyntaxNode {
  constructor(public statements: Array<SyntaxNode>, public eof: SyntaxToken<SyntaxKind.EndOfFileToken>) {
    super(eof.source, SyntaxKind.SyntaxCompilationUnit);
  }

  override getFirstChild(): SyntaxToken<Kind> {
    return this.statements.length > 0 ? this.statements[0].getFirstChild() : this.getLastChild();
  }

  override getLastChild(): SyntaxToken<Kind> {
    return this.eof;
  }
}
