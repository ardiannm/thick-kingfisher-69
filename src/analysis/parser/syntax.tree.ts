import { SourceText } from "../text/source.text";
import { Parser } from "../parser";
import { CompilationUnit } from "./compilation.unit";
import { DiagnosticsBag } from "../diagnostics/diagnostics.bag";
import { Binder } from "../binder";
import { CompilerOptions } from "../../compiler.options";
import { Evaluator } from "../../evaluator";
import { BoundCompilationUnit } from "../binder/compilation.unit";

export class SyntaxTree {
  public root: CompilationUnit;
  public readonly diagnosticsBag = new DiagnosticsBag();

  private constructor(public text: SourceText) {
    const parser = new Parser(this);
    this.root = parser.parse();
  }

  public static createFrom(text: string) {
    return new SyntaxTree(SourceText.createFrom(text));
  }

  bind() {
    if (this.diagnosticsBag.canBind()) {
      return new Binder(this.diagnosticsBag, new CompilerOptions(true, true, true)).bind(this.root);
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
