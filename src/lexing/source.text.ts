import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { SyntaxTree } from "../syntax.tree";
import { Lexer } from "./lexer";
import { Line } from "./line";
import { Token } from "./token";

export class SourceText {
  private lines = [] as Line[];
  private tokens = [] as Token[];

  private constructor(public text: string, public readonly diagnostics: DiagnosticsBag) {
    this.generateLines();
    this.generateTokens();
  }

  static createFrom(text: string): SourceText {
    const diagnostics = new DiagnosticsBag();
    return new SourceText(text, diagnostics);
  }

  static parse(text: string) {
    const tree = SyntaxTree.createFrom(text);
    return tree.source;
  }

  private generateTokens() {
    const lexer = Lexer.createFrom(this);
    for (const token of lexer.lex()) this.tokens.push(token);
  }

  private generateLines() {
    let start = 0;
    let position = 0;
    while (position < this.text.length) {
      const char = this.text[position];
      position++;
      if (char === "\n") {
        const span = Line.createFrom(this, start, position, 1);
        this.lines.push(span);
        start = position;
      }
    }
    const span = Line.createFrom(this, start, position, 0);
    this.lines.push(span);
    start = position;
  }

  private getLineAt(position: number) {
    let left = 0;
    let right = this.lines.length - 1;
    let middle;
    do {
      middle = left + Math.floor((right - left) / 2);
      const { start, end } = this.lines[middle].fullSpan;
      if (position >= end) {
        left = middle + 1;
      } else if (position < start) {
        right = middle;
      } else {
        break;
      }
    } while (left <= right);
    return middle;
  }

  getTokenAt(position: number) {
    let left = 0;
    let right = this.tokens.length - 1;
    let middle;
    do {
      middle = left + Math.floor((right - left) / 2);
      const { start, end } = this.tokens[middle].span;
      if (position >= end) {
        left = middle + 1;
      } else if (position < start) {
        right = middle;
      } else {
        break;
      }
    } while (left <= right);
    return middle;
  }

  getLines() {
    return this.lines;
  }

  getTokens() {
    return this.tokens;
  }

  getLine(position: number) {
    return this.getLineAt(position) + 1;
  }

  getColumn(position: number): number {
    return position - this.lines[this.getLineAt(position)].fullSpan.start + 1;
  }

  getPosition(line: number, column: number) {
    if (line < 1) {
      line = 1;
    } else if (line > this.lines.length) {
      return this.text.length;
    }
    const span = this.lines[line - 1].span;
    let offset = column - 1;
    if (offset > span.length) {
      offset = span.length;
    } else if (offset < 0) {
      offset = 0;
    }
    return span.start + offset;
  }
}
