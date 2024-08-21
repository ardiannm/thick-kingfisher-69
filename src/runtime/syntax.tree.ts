import { SourceText } from "../analysis/text/source.text";
import { Parser } from "../analysis/parser";
import { SyntaxCompilationUnit } from "../analysis/parser/syntax.compilation.unit";
import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { CompilerOptions } from "../compiler.options";
import { Evaluator } from "./evaluator";
import { BoundCompilationUnit } from "../analysis/binder/bound.compilation.unit";
import { Binder } from "../analysis/binder";

export class SyntaxTree {
  protected root: SyntaxCompilationUnit;
  public readonly diagnostics = new DiagnosticsBag();

  private constructor(public text: SourceText, public configuration: CompilerOptions) {
    const parser = new Parser(this);
    this.root = parser.parseCompilationUnit();
  }

  public static createFrom(text: string, configuration: CompilerOptions) {
    return new SyntaxTree(SourceText.createFrom(text), configuration);
  }

  bind() {
    if (this.diagnostics.canBind()) {
      return new Binder().bind(this.root);
    }
    return this;
  }

  evaluate() {
    const tree = this.bind();
    if (this.diagnostics.canEvaluate()) {
      return new Evaluator(this.diagnostics).evaluate(tree as BoundCompilationUnit);
    }
    return this;
  }
}
