import { CompilerOptions } from "./compiler.options"
import { Binder } from "./phases/binding/binder"
import { BoundCompilationUnit } from "./phases/binding/bound.compilation.unit"
import { SourceText } from "./phases/lexing/source.text"
import { Parser } from "./phases/parsing/parser"
import { SyntaxCompilationUnit } from "./phases/parsing/syntax.compilation.unit"

export class SyntaxTree {
  compilationUnit: SyntaxCompilationUnit
  boundCompilationUnit: BoundCompilationUnit

  private constructor(public source: SourceText, public configuration: CompilerOptions) {
    this.compilationUnit = Parser.parseCompilationUnit(source)
    this.boundCompilationUnit = Binder.bindCompilationUnit(this.compilationUnit, configuration)
  }

  static create(text: string | SourceText = "", configuration: CompilerOptions = new CompilerOptions(true)) {
    const sourceText = text instanceof SourceText ? text : SourceText.create(text)
    return new SyntaxTree(sourceText, configuration)
  }
}
