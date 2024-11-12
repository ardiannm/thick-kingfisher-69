import { TextSpan } from "../../lexing/text.span";
import { Token } from "../../lexing/token";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SourceText } from "../../lexing/source.text";

export class SyntaxToken<T extends SyntaxKind = SyntaxKind> extends SyntaxNode {
  private constructor(public override sourceText: SourceText, public override kind: T, private textSpan: TextSpan, public trivias: Token[]) {
    super(sourceText, kind);
  }

  static createFrom(sourceText: SourceText, token: Token, trivias: Token[]) {
    return new SyntaxToken(sourceText, token.kind, token.span, trivias);
  }

  override hasTrivia(): boolean {
    return this.trivias.length > 0;
  }

  override get span() {
    return this.textSpan;
  }

  override get fullSpan() {
    const start = !!this.trivias.length ? this.trivias[0].span.start : this.span.start;
    const end = this.span.end;
    return TextSpan.createFrom(this.sourceText, start, end, 0);
  }

  override getFirstChild() {
    return this;
  }

  override getLastChild() {
    return this;
  }
}
