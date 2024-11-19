import { SyntaxKind } from "../analysis/parsing/syntax.kind";
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

  get text() {
    return this.span.text;
  }

  *getTokens(): Generator<Token> {
    const tokens = this.source.getTokens(); // Assume tokens is sorted by position
    const lineStart = this.span.start;
    const lineEnd = this.span.end;

    let index = this.source.getTokenIndex(lineStart);

    while (index < tokens.length) {
      const token = tokens[index];

      // Stop if the token starts beyond the line's end
      if (token.span.start >= lineEnd) break;

      const overlappingToken = token.getOverlapWithLine(this);

      // Yield only if there's an overlap and it's not a line break
      if (overlappingToken && overlappingToken.kind !== SyntaxKind.LineBreakTrivia) {
        yield overlappingToken;
      }

      index++;
    }
  }
}
