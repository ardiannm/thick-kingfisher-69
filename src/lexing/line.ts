import { SourceText } from "./source.text";
import { Span } from "./span";
import { Token } from "./token";

export class Line {
  private constructor(public source: SourceText, public fullSpan: Span, private lineBreakLength: number) {}

  static createFrom(source: SourceText, start: number, end: number, lineBreakLength: number) {
    return new Line(source, Span.createFrom(source, start, end), lineBreakLength);
  }

  get span() {
    return Span.createFrom(this.source, this.fullSpan.start, this.fullSpan.end - this.lineBreakLength);
  }

  *getTokens(): Generator<Token> {
    const tokens = this.source.getTokens();
    const tokenStart = this.source.getTokenLocation(this.span.start);
    const token = tokens[tokenStart];
    yield this.trimToken(token);
    if (!this.span.length) {
      return;
    }
    const tokenEnd = this.source.getTokenLocation(this.span.end);
    for (let position = tokenStart + 1; position < tokenEnd; position++) {
      yield tokens[position];
    }
    if (tokenStart < tokenEnd) {
      const token = tokens[tokenEnd];
      yield this.trimToken(token);
    }
  }

  private trimToken(token: Token) {
    const lineStart = this.fullSpan.start;
    const lineEnd = this.fullSpan.end;
    let tokenStart = token.span.start;
    let tokenEnd = token.span.end;
    if (tokenStart >= lineStart && tokenEnd <= lineEnd) {
      return token;
    }
    if (tokenStart < lineStart) tokenStart = lineStart;
    if (tokenEnd > lineEnd) tokenEnd = lineEnd;
    return new Token(token.kind, Span.createFrom(this.source, tokenStart, tokenEnd));
  }
}
