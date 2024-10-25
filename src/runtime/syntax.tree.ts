import { SourceText } from "../analysis/text/source.text";
import { Parser } from "../analysis/parser";
import { SyntaxCompilationUnit } from "../analysis/parser/syntax.compilation.unit";
import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { CompilerOptions } from "../compiler.options";
import { BoundCompilationUnit } from "../analysis/binder/bound.compilation.unit";
import { Binder } from "../analysis/binder";

export class SyntaxTree {
  syntaxRoot: SyntaxCompilationUnit;
  bound: BoundCompilationUnit;

  readonly diagnostics = new DiagnosticsBag();

  private constructor(public sourceText: SourceText, public configuration: CompilerOptions) {
    this.syntaxRoot = Parser.parseCompilationUnit(this);
    this.bound = Binder.bindCompilationUnit(this.syntaxRoot);
  }

  static createFrom(text: string = "", configuration: CompilerOptions = new CompilerOptions(true)) {
    const sourceText = SourceText.createFrom(text);
    return new SyntaxTree(sourceText, configuration);
  }
}
