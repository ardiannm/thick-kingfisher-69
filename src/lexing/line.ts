import { SyntaxKind } from "../analysis/parsing/syntax.kind";
import { SourceText } from "./source.text";
import { Span } from "./span";
import { Token } from "./token";

export class Line {
  private constructor(public source: SourceText, public start: number, public end: number, public lineBreakLength: number) {}

  static createFrom(source: SourceText, start: number, end: number, lineBreakLength: number) {
    return new Line(source, start, end, lineBreakLength);
  }

  get span() {
    return Span.createFrom(this.source, this.fullSpan.start, this.fullSpan.end - this.lineBreakLength);
  }

  get fullSpan() {
    return Span.createFrom(this.source, this.start, this.end);
  }

  getTokens(): Token[] {
    const tokens = this.source.getTokens();
    const cursor = this.source.getTokenIndex(this.start);
    let token = tokens[cursor];
    if (token.span.start < this.start || token.span.end > this.end) {
      const end = Math.min(this.end, token.span.end);
      token = new Token(token.kind, Span.createFrom(this.source, this.start, end));
    }
    if (token.kind === SyntaxKind.LineBreakTrivia) return [];
    return [token];
  }
}
