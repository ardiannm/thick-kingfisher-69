import { SourceText } from "../../lexing/source.text";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";
import { SyntaxStatement } from "./sytax.statements";

export class SyntaxBlock extends SyntaxNode {
  constructor(
    public override text: SourceText,
    public openBrace: SyntaxToken<SyntaxNodeKind.OpenBraceToken>,
    public statements: Array<SyntaxStatement>,
    public closeBrace: SyntaxToken<SyntaxNodeKind.CloseBraceToken>
  ) {
    super(text, SyntaxNodeKind.SyntaxBlock);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.openBrace;
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.closeBrace;
  }
}
