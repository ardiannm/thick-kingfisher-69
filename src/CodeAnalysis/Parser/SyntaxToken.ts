import { SyntaxNode } from "./SyntaxNode";
import { TokenKind } from "./TokenKind";

export class SyntaxToken extends SyntaxNode {
  constructor(public Kind: TokenKind, public Text: string) {
    super(Kind);
  }
}
