import { Token } from "../../lexing/token";
import { Kind } from "./syntax.kind";
import { SyntaxNode } from "./syntax.node";
import { SourceText } from "../../lexing/source.text";
import { Span } from "../../lexing/span";

export class SyntaxToken<T extends Kind = Kind> extends SyntaxNode {
  private constructor(public override sourceText: SourceText, public override kind: T, private textSpan: Span, public trivias: Token[]) {
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
    return new Span(this.sourceText, start, end);
  }

  override getFirstChild() {
    return this;
  }

  override getLastChild() {
    return this;
  }
}
