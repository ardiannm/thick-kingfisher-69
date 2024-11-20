import { SourceText } from "./source.text";
import { Span } from "./span";
import { Token } from "./token";

export class Line {
  private constructor(public source: SourceText, private start: number, private end: number, public lineBreakLength: number) {}

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
    let start = this.source.getTokenIndex(this.start);
    let end = this.source.getTokenIndex(this.end - this.lineBreakLength - 1);
    while (start <= end) {
      let token = tokens[start];
      if (token.isMultiLine()) {
        token = token.getOverlapWithLine(this)!;
      }
      yield token;
      start++;
    }
  }
}
