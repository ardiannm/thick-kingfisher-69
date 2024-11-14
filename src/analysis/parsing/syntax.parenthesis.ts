import { SourceText } from "../../lexing/source.text";
import { Kind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxParenthesis extends SyntaxNode {
  constructor(
    public override sourceText: SourceText,
    public openParen: SyntaxToken<SyntaxKind.OpenParenthesisToken>,
    public expression: SyntaxNode,
    public closeParen: SyntaxToken<SyntaxKind.CloseParenthesisToken>
  ) {
    super(sourceText, SyntaxKind.SyntaxParenthesis);
  }

  override getFirstChild(): SyntaxToken<Kind> {
    return this.openParen;
  }

  override getLastChild(): SyntaxToken<Kind> {
    return this.closeParen;
  }
}
