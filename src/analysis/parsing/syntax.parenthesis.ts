import { SourceText } from "../../lexing/source.text";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "./syntax.token";

export class SyntaxParenthesis extends SyntaxNode {
  constructor(
    public override sourceText: SourceText,
    public openParen: SyntaxToken<SyntaxNodeKind.OpenParenthesisToken>,
    public expression: SyntaxNode,
    public closeParen: SyntaxToken<SyntaxNodeKind.CloseParenthesisToken>
  ) {
    super(sourceText, SyntaxNodeKind.SyntaxParenthesis);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.openParen;
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.closeParen;
  }
}
