import { SourceText } from "./source.text";
import { Span } from "./span";
import { Token } from "./token";

export class Line {
  private constructor(public source: SourceText, private start: number, private end: number, private lineBreakLength: number) {}

  static createFrom(source: SourceText, start: number, end: number, lineBreakLength: number) {
    return new Line(source, start, end, lineBreakLength);
  }

  get span() {
    return Span.createFrom(this.source, this.fullSpan.start, this.fullSpan.end - this.lineBreakLength);
  }

  get fullSpan() {
    return Span.createFrom(this.source, this.start, this.end);
  }

  *getTokens(): Generator<Token> {
    const tokens = this.source.getTokens();
    let tokenStart = this.source.getTokenAt(this.start);
    yield tokens[tokenStart].getOverlapWithLine(this)!;
    const tokenEnd = this.source.getTokenAt(Math.max(this.start, this.span.end));
    for (let position = tokenStart + 1; position < tokenEnd; position++) {
      yield tokens[position];
    }
    if (tokenStart < tokenEnd) {
      yield tokens[tokenEnd].getOverlapWithLine(this)!;
    }
  }
}
