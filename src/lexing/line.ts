import { SourceText as Text } from "./source.text";
import { Span } from "./span";
import { Token } from "./token";

export class Line {
  private constructor(public source: Text, private start: number, private end: number, public lineBreakLength: number) {}

  static createFrom(source: Text, start: number, end: number, lineBreakLength: number) {
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
    let start = this.source.getTokenAt(this.start);
    let end = this.source.getTokenAt(this.end - this.lineBreakLength - 1);

    for (let i = start; i <= end; i++) {
      const token = tokens[i];
      yield token.isMultiLine() ? token.getOverlapWithLine(this)! : token;
    }
  }
}
