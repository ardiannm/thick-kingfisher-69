import { SourceText } from "../analysis/text/source.text";
import { Parser } from "../analysis/parser";
import { SyntaxCompilationUnit } from "../analysis/parser/syntax.compilation.unit";
import { DiagnosticsBag } from "../analysis/diagnostics/diagnostics.bag";
import { Binder } from "../analysis/binder";
import { CompilerOptions } from "../compiler.options";
import { Evaluator } from "./evaluator";
import { BoundCompilationUnit } from "../analysis/binder/bound.compilation.unit";

export class SyntaxTree {
  public root: SyntaxCompilationUnit;
  public readonly diagnostics = new DiagnosticsBag(this.text);

  private constructor(public text: SourceText) {
    const parser = new Parser(this);
    this.root = parser.parseCompilationUnit();
  }

  public static createFrom(text: string) {
    return new SyntaxTree(SourceText.createFrom(text));
  }

  bind() {
    if (this.diagnostics.canBind()) {
      return new Binder(this.diagnostics, new CompilerOptions(true)).bind(this.root);
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
