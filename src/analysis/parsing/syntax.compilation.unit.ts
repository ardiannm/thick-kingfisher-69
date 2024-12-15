import { SourceText } from "../../lexing/source.text";
import { Kind, SyntaxKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxCompilationUnit extends SyntaxNode {
  constructor(public override source: SourceText, public statements: Array<SyntaxNode>, public eof: SyntaxToken<SyntaxKind.EndOfFileToken>) {
    super(source, SyntaxKind.SyntaxCompilationUnit);
  }

  override getFirstChild(): SyntaxToken<Kind> {
    return this.statements.length > 0 ? this.statements[0].getFirstChild() : this.getLastChild();
  }

  override getLastChild(): SyntaxToken<Kind> {
    return this.eof;
  }
}
