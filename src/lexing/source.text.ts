import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { Lexer } from "./lexer";
import { LineSpan } from "./line.span";
import { Token } from "./token";

export class SourceText {
  private spans = [] as LineSpan[];
  private tokens = [] as Token[];
  readonly diagnostics = new DiagnosticsBag(this);

  private constructor(public text: string) {
    this.splitInLines();
    this.tokenize();
  }

  static createFrom(text: string): SourceText {
    return new SourceText(text);
  }

  private tokenize() {
    const lexer = Lexer.createFrom(this);
    for (const token of lexer.lex()) this.tokens.push(token);
  }

  private splitInLines() {
    let start = 0;
    let cursor = 0;
    while (cursor < this.text.length) {
      const char = this.text[cursor];
      cursor++;
      if (char === "\n") {
        const span = LineSpan.createFrom(this, start, cursor, 1);
        this.spans.push(span);
        start = cursor;
      }
    }
    const span = LineSpan.createFrom(this, start, cursor, 0);
    this.spans.push(span);
    start = cursor;
  }

  private getLineIndex(cursor: number) {
    let left = 0;
    let right = this.spans.length - 1;
    let index;
    do {
      index = left + Math.floor((right - left) / 2);
      const span = this.spans[index];
      if (cursor >= span.end) {
        left = index + 1;
      } else if (cursor < span.start) {
        right = index;
      } else {
        break;
      }
    } while (left <= right);
    return index;
  }

  getTokenIndex(cursor: number) {
    let left = 0;
    let right = this.tokens.length - 1;
    let index;
    do {
      index = left + Math.floor((right - left) / 2);
      const token = this.tokens[index];
      if (cursor >= token.span.end) {
        left = index + 1;
      } else if (cursor < token.span.start) {
        right = index;
      } else {
        break;
      }
    } while (left <= right);
    return index;
  }

  getLines() {
    return this.spans;
  }

  getTokens() {
    return this.tokens;
  }

  getLine(position: number) {
    return this.getLineIndex(position) + 1;
  }

  getColumn(position: number): number {
    const index = this.getLineIndex(position);
    return position - this.spans[index].start + 1;
  }

  getCursorPosition(line: number, column: number) {
    const index = Math.min(Math.max(1, line), this.spans.length) - 1;
    const span = this.spans[index];
    const offset = Math.min(column - 1, span.length);
    return span.start + offset;
  }
}
