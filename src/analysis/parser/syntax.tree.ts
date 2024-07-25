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
    if (this.diagnosticsBag.isEmpty()) {
      return new Binder(this.diagnosticsBag, new CompilerOptions(true, true, true)).bind(this.root);
    }
    return this;
  }

  evaluate() {
    const program = this.bind();
    if (this.diagnosticsBag.isEmpty()) {
      return new Evaluator(this.diagnosticsBag).evaluate(program as BoundCompilationUnit);
    }
    return this;
  }
}
