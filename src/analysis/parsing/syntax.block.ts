import { SourceText } from "../../lexing/source.text";
import { Kind, SyntaxKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxBlock extends SyntaxNode {
  constructor(
    public override source: SourceText,
    public openBrace: SyntaxToken<SyntaxKind.OpenBraceToken>,
    public statements: Array<SyntaxNode>,
    public closeBrace: SyntaxToken<SyntaxKind.CloseBraceToken>
  ) {
    super(source, SyntaxKind.SyntaxBlock);
  }

  override getFirstChild(): SyntaxToken<Kind> {
    return this.openBrace;
  }

  override getLastChild(): SyntaxToken<Kind> {
    return this.closeBrace;
  }
}
