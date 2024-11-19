import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { Lexer } from "./lexer";
import { Line } from "./line";
import { Token } from "./token";

export class SourceText {
  private lines = [] as Line[];
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
        const span = Line.createFrom(this, start, cursor, 1);
        this.lines.push(span);
        start = cursor;
      }
    }
    const span = Line.createFrom(this, start, cursor, 0);
    this.lines.push(span);
    start = cursor;
  }

  private getLineIndex(cursor: number) {
    let left = 0;
    let right = this.lines.length - 1;
    let mid;
    do {
      mid = left + Math.floor((right - left) / 2);
      const fullSpan = this.lines[mid].fullSpan;
      if (cursor >= fullSpan.end) {
        left = mid + 1;
      } else if (cursor < fullSpan.start) {
        right = mid;
      } else {
        break;
      }
    } while (left <= right);
    return mid;
  }

  getTokenIndex(cursor: number) {
    let left = 0;
    let right = this.tokens.length - 1;
    let mid;
    do {
      mid = left + Math.floor((right - left) / 2);
      const token = this.tokens[mid];
      if (cursor >= token.span.end) {
        left = mid + 1;
      } else if (cursor < token.span.start) {
        right = mid;
      } else {
        break;
      }
    } while (left <= right);
    return mid;
  }

  getLines() {
    return this.lines;
  }

  getLine(number: number) {
    return this.lines[number - 1];
  }

  getTokens() {
    return this.tokens;
  }

  getLineNumber(cursor: number) {
    return this.getLineIndex(cursor) + 1;
  }

  getColumnNumber(cursor: number): number {
    return cursor - this.lines[this.getLineIndex(cursor)].fullSpan.start + 1;
  }

  getCursorPosition(line: number, column: number) {
    const index = Math.min(Math.max(1, line), this.lines.length) - 1;
    const fullSpan = this.lines[index].fullSpan;
    const offset = Math.min(column - 1, fullSpan.length);
    return fullSpan.start + offset;
  }
}
