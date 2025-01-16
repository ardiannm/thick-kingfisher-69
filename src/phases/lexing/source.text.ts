import { DiagnosticsBag } from "../../diagnostics/diagnostics.bag"
import { SyntaxTree } from "../../syntax.tree"
import { Parser } from "../parsing/parser"
import { SyntaxToken } from "./syntax.token"
import { Lexer } from "./lexer"
import { Line } from "./line"

export class SourceText {
  private lines = [] as Line[]
  public tokens = [] as SyntaxToken[]

  private constructor(public text: string, public readonly diagnostics: DiagnosticsBag) {
    this.generateLines()
    this.generateTokens()
  }

  static createFrom(text: string): SourceText {
    const diagnostics = new DiagnosticsBag()
    return new SourceText(text, diagnostics)
  }

  static parse(text: string) {
    return Parser.parseCompilationUnit(SourceText.createFrom(text)).source
  }

  static bind(text: string) {
    return SyntaxTree.createFrom(text).source
  }

  private generateTokens() {
    const lexer = Lexer.createFrom(this)
    for (const token of lexer.lex()) this.tokens.push(token)
  }

  private generateLines() {
    let start = 0
    let position = 0
    while (position < this.text.length) {
      const char = this.text[position]
      position++
      if (char === "\n") {
        const span = Line.createFrom(this, this.lines.length + 1, start, position, 1)
        this.lines.push(span)
        start = position
      }
    }
    const span = Line.createFrom(this, this.lines.length + 1, start, position, 0)
    this.lines.push(span)
    start = position
  }

  private getLinePosition(position: number) {
    let left = 0
    let right = this.lines.length - 1
    let middle
    do {
      middle = left + Math.floor((right - left) / 2)
      const { start, end } = this.lines[middle].fullSpan
      if (position >= end) {
        left = middle + 1
      } else if (position < start) {
        right = middle
      } else {
        break
      }
    } while (left <= right)
    return middle
  }

  getTokenPosition(position: number) {
    if (position < 0) return 0
    if (position > this.text.length) return this.tokens.length - 1
    let left = 0
    let right = this.tokens.length - 1
    let middle
    do {
      middle = left + Math.floor((right - left) / 2)
      const { start, end } = this.tokens[middle].span
      if (position >= end) {
        left = middle + 1
      } else if (position < start) {
        right = middle
      } else {
        break
      }
    } while (left <= right)
    return middle
  }

  getLines() {
    return this.lines
  }

  getLine(position: number) {
    return this.lines[this.getLinePosition(position)]
  }

  getColumn(position: number): number {
    return position - this.lines[this.getLinePosition(position)].fullSpan.start + 1
  }

  getPosition(line: number, column: number) {
    if (line < 1) {
      return 0
    } else if (line > this.lines.length) {
      return this.text.length
    }
    const span = this.lines[line - 1].span
    let offset = column - 1
    if (offset > span.length) {
      offset = span.length
    } else if (offset < 0) {
      offset = 0
    }
    return span.start + offset
  }
}
