import { SourceText } from "../text/source.text";
import { Parser } from "../parser";
import { CompilationUnit } from "./compilation.unit";
import { DiagnosticBag } from "../diagnostics/diagnostic.bag";
import { Binder } from "../binder";
import { CompilerOptions } from "../../compiler.options";
import { Evaluator } from "../../evaluator";
import { BoundCompilationUnit } from "../binder/compilation.unit";

export class SyntaxTree {
  public readonly sourceText: SourceText;
  public readonly diagnostics = new DiagnosticBag();

  constructor(text: string) {
    this.sourceText = SourceText.from(text);
  }

  static from(text: string) {
    return new SyntaxTree(text);
  }

  parse() {
    const parser = new Parser(this);
    if (this.diagnostics.empty()) {
      return parser.parse();
    }
    return this;
  }

  bind() {
    const program = this.parse() as CompilationUnit;
    if (this.diagnostics.empty()) {
      return new Binder(this.diagnostics, new CompilerOptions(true, true, true)).bind(program);
    }
    return this;
  }

  evaluate() {
    const program = this.bind();
    if (this.diagnostics.empty()) {
      return new Evaluator(this.diagnostics).evaluate(program as BoundCompilationUnit);
    }
    return this;
  }
}
