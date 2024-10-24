import { SourceText } from "../analysis/text/source.text";
import { Parser } from "../analysis/parser";
import { SyntaxCompilationUnit } from "../analysis/parser/syntax.compilation.unit";
import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { CompilerOptions } from "../compiler.options";
import { Evaluator } from "./evaluator";
import { BoundCompilationUnit } from "../analysis/binder/bound.compilation.unit";
import { Binder } from "../analysis/binder";

export class SyntaxTree {
  public syntaxRoot: SyntaxCompilationUnit;
  public boundRoot: BoundCompilationUnit;

  public readonly diagnostics = new DiagnosticsBag();

  private constructor(public sourceText: SourceText, public configuration: CompilerOptions) {
    const parser = new Parser(this);
    this.syntaxRoot = parser.parseCompilationUnit();
    this.boundRoot = BoundCompilationUnit.createFrom(this.syntaxRoot);
  }

  public static createFrom(text: string = "", configuration: CompilerOptions = new CompilerOptions(true)) {
    const sourceText = SourceText.createFrom(text);
    return new SyntaxTree(sourceText, configuration);
  }

  bind() {
    if (this.diagnostics.canBind()) {
      const bound = new Binder().bindSyntaxCompilationUnit(this.syntaxRoot);
      this.boundRoot = bound;
    }
    return this;
  }

  evaluate() {
    if (this.diagnostics.canEvaluate()) {
      return new Evaluator(this.diagnostics).evaluate(this.boundRoot);
    }
    return this;
  }
}
