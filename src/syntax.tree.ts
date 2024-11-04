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

  private constructor(public text: SourceText, public configuration: CompilerOptions) {
    this.syntaxRoot = Parser.parseCompilationUnit(text);
    this.bound = Binder.bindCompilationUnit(this.syntaxRoot, configuration);
  }

  static createFrom(text: string | SourceText = "", configuration: CompilerOptions = new CompilerOptions(true)) {
    const sourceText = text instanceof SourceText ? text : SourceText.createFrom(text);
    return new SyntaxTree(sourceText, configuration);
  }
}
