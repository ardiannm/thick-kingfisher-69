import { Binder } from "./analysis/binder/binder";
import { BoundCompilationUnit } from "./analysis/binder/bound.compilation.unit";
import { DiagnosticsBag } from "./analysis/diagnostics/diagnostics.bag";
import { Parser } from "./analysis/parsing/parser";
import { SyntaxCompilationUnit } from "./analysis/parsing/syntax.compilation.unit";
import { SourceText } from "./lexing/source.text";

export class CompilerOptions {
  constructor(public explicitDeclarations: boolean) {}
}

export class SyntaxTree {
  syntaxRoot: SyntaxCompilationUnit;
  bound: BoundCompilationUnit;

  readonly diagnostics = new DiagnosticsBag();

  private constructor(public text: SourceText, public configuration: CompilerOptions) {
    this.syntaxRoot = Parser.parseCompilationUnit(this);
    this.bound = Binder.bindCompilationUnit(this.syntaxRoot);
  }

  static createFrom(text: string = "", configuration: CompilerOptions = new CompilerOptions(true)) {
    return new SyntaxTree(SourceText.createFrom(text), configuration);
  }
}
