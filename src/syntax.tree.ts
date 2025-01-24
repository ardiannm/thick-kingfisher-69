import { Binder } from "./phases/binding/binder"
import { SourceText } from "./phases/lexing/source.text"
import { Parser } from "./phases/parsing/parser"

export class SyntaxTree {
  compilationUnit = Parser.parseCompilationUnit(this.source)
  boundCompilationUnit = Binder.bindCompilationUnit(this.compilationUnit)

  private constructor(public source: SourceText) {}

  static create(text: string) {
    return new SyntaxTree(SourceText.create(text))
  }
}
