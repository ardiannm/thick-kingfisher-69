import { Binder } from "./analysis/binder/binder";
import { BoundCompilationUnit } from "./analysis/binder/bound.compilation.unit";
import { Parser } from "./analysis/parsing/parser";
import { SyntaxCompilationUnit } from "./analysis/parsing/syntax.compilation.unit";
import { SourceText } from "./lexing/source.text";

export class CompilerOptions {
  constructor(public explicitDeclarations: boolean) {}
}

export class SyntaxTree {
  syntaxRoot: SyntaxCompilationUnit;
  bound: BoundCompilationUnit;

  private constructor(public sourceText: SourceText, public configuration: CompilerOptions) {
    this.syntaxRoot = Parser.parseCompilationUnit(sourceText);
    this.bound = Binder.bindCompilationUnit(this.syntaxRoot, this.sourceText.diagnostics, configuration);
  }

  static createFrom(sourceText: SourceText = SourceText.createFrom(""), configuration: CompilerOptions = new CompilerOptions(true)) {
    return new SyntaxTree(sourceText, configuration);
  }
}
