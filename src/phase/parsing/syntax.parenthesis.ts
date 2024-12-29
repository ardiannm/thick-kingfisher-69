import { SyntaxKind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SyntaxToken } from "../lexing/syntax.token";

export class SyntaxParenthesis extends SyntaxNode {
  constructor(public left: SyntaxToken<SyntaxKind.OpenParenthesisToken>, public expression: SyntaxNode, public right: SyntaxToken<SyntaxKind.CloseParenthesisToken>) {
    super(left.source, SyntaxKind.SyntaxParenthesis);
  }

  override getFirstChild(): SyntaxToken<SyntaxKind> {
    return this.left;
  }

  override getLastChild(): SyntaxToken<SyntaxKind> {
    return this.right;
  }
}
