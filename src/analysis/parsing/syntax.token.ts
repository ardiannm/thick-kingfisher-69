import { Span } from "../../lexing/span";
import { Token } from "../../lexing/token";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNode } from "./syntax.node";

export class SyntaxToken<T extends SyntaxKind = SyntaxKind> extends SyntaxNode {
  private constructor(public override kind: T, private textSpan: Span, public trivias: Token[]) {
    super(kind);
  }

  static createFrom(token: Token, trivias: Token[]) {
    return new SyntaxToken(token.kind, token.span, trivias);
  }

  override hasTrivia(): boolean {
    return this.trivias.length > 0;
  }

  override get span() {
    return this.textSpan;
  }

  override getFirstChild() {
    return this;
  }

  override getLastChild() {
    return this;
  }
}
