import { SourceText } from "../analysis/text/source.text";
import { Parser } from "../analysis/parser";
import { CompilationUnit } from "../analysis/parser/compilation.unit";
import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { Binder } from "../analysis/binder";
import { CompilerOptions } from "../compiler.options";
import { Evaluator } from "./evaluator";
import { BoundCompilationUnit } from "../analysis/binder/compilation.unit";

export class SyntaxTree {
  public root: CompilationUnit;
  public readonly diagnosticsBag = new DiagnosticsBag();

  private constructor(public text: SourceText) {
    const parser = new Parser(this);
    this.root = parser.parseCompilationUnit();
  }

  public static createFrom(text: string) {
    return new SyntaxTree(SourceText.createFrom(text));
  }

  bind() {
    if (this.diagnosticsBag.canBind()) {
      return new Binder(this.diagnosticsBag, new CompilerOptions(true)).bind(this.root);
    }
    return this;
  }

  evaluate() {
    const tree = this.bind();
    if (this.diagnosticsBag.canEvaluate()) {
      return new Evaluator(this.diagnosticsBag).evaluate(tree as BoundCompilationUnit);
    }
    return this;
  }
}
