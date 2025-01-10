import { Binder } from "./phase/binding/binder"
import { BoundCompilationUnit } from "./phase/binding/bound.compilation.unit"
import { SourceText } from "./phase/lexing/source.text"
import { Parser } from "./phase/parsing/parser"
import { SyntaxCompilationUnit } from "./phase/parsing/syntax.compilation.unit"

export class CompilerOptions {
  constructor(public explicitDeclarations: boolean) {}
}

export class SyntaxTree {
  root: SyntaxCompilationUnit
  bound: BoundCompilationUnit

  private constructor(public source: SourceText, public configuration: CompilerOptions) {
    this.root = Parser.parseCompilationUnit(source)
    this.bound = Binder.bindCompilationUnit(this.root, configuration)
  }

  static createFrom(text: string | SourceText = "", configuration: CompilerOptions = new CompilerOptions(true)) {
    const sourceText = text instanceof SourceText ? text : SourceText.createFrom(text)
    return new SyntaxTree(sourceText, configuration)
  }
}
