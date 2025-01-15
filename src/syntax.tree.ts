import { Binder } from "./phases/binding/binder"
import { BoundCompilationUnit } from "./phases/binding/bound.compilation.unit"
import { SourceText } from "./phases/lexing/source.text"
import { Parser } from "./phases/parsing/parser"
import { SyntaxCompilationUnit } from "./phases/parsing/syntax.compilation.unit"

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
