import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { Lexer } from "./lexer";
import { TextSpan } from "./text.span";
import { Token } from "./token";

export class SourceText {
  private spans = [] as TextSpan[];
  readonly tokens = [] as Token[];
  readonly diagnostics = new DiagnosticsBag(this);

  private constructor(public text: string) {
    let start = 0;
    let position = 0;
    while (position < this.text.length) {
      const char = this.text[position];
      position++;
      if (char === "\n") {
        const span = TextSpan.createFrom(this, start, position, 1);
        this.spans.push(span);
        start = position;
      }
    }
    const span = TextSpan.createFrom(this, start, position, 0);
    this.spans.push(span);
    start = position;
    const lexer = Lexer.createFrom(this);
    for (const token of lexer.lex()) this.tokens.push(token);
  }

  static createFrom(text: string): SourceText {
    return new SourceText(text);
  }

  private getLinePosition(position: number): number {
    let lower = 0;
    let upper = this.spans.length - 1;
    while (lower <= upper) {
      var index = Math.floor(lower + (upper - lower) / 2);
      var start = this.spans[index].start;
      if (position === start) return index;
      if (start > position) {
        upper = index - 1;
      } else {
        lower = index + 1;
      }
    }
    return lower - 1;
  }

  getLine(position: number) {
    return this.getLinePosition(position) + 1;
  }

  getColumn(position: number): number {
    const span = this.getLinePosition(position);
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
}
