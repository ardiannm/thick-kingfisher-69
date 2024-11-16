import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { Lexer } from "./lexer";
import { LineSpan } from "./line.span";
import { Span } from "./span";
import { Token } from "./token";

export class SourceText {
  private spans = [] as LineSpan[];
  private tokens = [] as Token[];
  readonly diagnostics = new DiagnosticsBag(this);

  private constructor(public text: string) {
    this.splitInLines();
    this.tokenize();
  }

  private tokenize() {
    const lexer = Lexer.createFrom(this);
    for (const token of lexer.lex()) this.tokens.push(token);
  }

  private splitInLines() {
    let start = 0;
    let position = 0;
    while (position < this.text.length) {
      const char = this.text[position];
      position++;
      if (char === "\n") {
        const span = LineSpan.createFrom(this, start, position, 1);
        this.spans.push(span);
        start = position;
      }
    }
    const span = LineSpan.createFrom(this, start, position, 0);
    this.spans.push(span);
    start = position;
  }

  static createFrom(text: string): SourceText {
    return new SourceText(text);
  }

  private getLineIndex(position: number): number {
    let left = 0;
    let right = this.spans.length - 1;
    while (left <= right) {
      var index = Math.floor(left + (right - left) / 2);
      var start = this.spans[index].start;
      if (position === start) return index;
      if (start > position) {
        right = index - 1;
      } else {
        left = index + 1;
      }
    }
    return left - 1;
  }

  getTokens() {
    return this.tokens;
  }

  getLine(position: number) {
    return this.getLineIndex(position) + 1;
  }

  getColumn(position: number): number {
    const span = this.getLineIndex(position);
    return position - this.spans[span].start + 1;
  }

  getLines() {
    return this.spans;
  }

  getPosition(line: number, column: number) {
    const index = Math.min(Math.max(1, line), this.spans.length) - 1;
    const span = this.spans[index];
    const offset = Math.min(column - 1, span.length);
    return span.start + offset;
  }

  getTokenIndex(position: number) {
    let left = 0;
    let right = this.tokens.length - 1;
    let span: Span;
    let index;
    do {
      index = left + Math.floor((right - left) / 2);
      const token = this.tokens[index];
      span = token.span;
      const start = span.start;
      const end = span.end;
      if (position >= end) {
        left = index + 1;
      } else if (position < start) {
        right = index;
      } else {
        break;
      }
    } while (left <= right);
    return index;
  }
}
