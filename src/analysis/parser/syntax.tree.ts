import { SyntaxNode } from "./syntax.node";
import { Parser } from "../parser";
import { Binder } from "../binder";
import { BoundNode } from "../binder/bound.node";
import { BoundNumericLiteral } from "../binder/numeric.literal";
import { BoundKind } from "../binder/kind/bound.kind";
import { Evaluator } from "../../evaluator";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { CompilerOptions } from "../../compiler.options";
import { DiagnosticBag } from "../diagnostics/diagnostic.bag";
import { SourceText } from "../input/source.text";

export class SyntaxTree {
  evaluator: Evaluator;
  tree: SyntaxNode;
  boundTree: BoundNode;
  binder: Binder;
  value = 0;

  private constructor(public diagnostics: DiagnosticBag, private configuration: CompilerOptions) {
    this.binder = new Binder(this.diagnostics, this.configuration);
    this.evaluator = new Evaluator(this.diagnostics);
    this.tree = new SyntaxNode(SyntaxNodeKind.BadToken);
    this.boundTree = new BoundNumericLiteral(BoundKind.NumericLiteral, 0) as BoundNode;
  }

  static Init(settings: CompilerOptions) {
    const diagnostics = new DiagnosticBag();
    return new SyntaxTree(diagnostics, settings);
  }

  Parse(text: string) {
    this.binder.scope.ClearUndeclared();
    this.diagnostics.Clear();
    const input = SourceText.From(text, this.diagnostics);
    const parser = new Parser(input, this.diagnostics);
    this.tree = parser.Parse();
    return this;
  }

  Bind() {
    if (this.diagnostics.None()) {
      this.boundTree = this.binder.Bind(this.tree);
    }
    return this;
  }

  Evaluate() {
    if (this.diagnostics.None()) {
      this.value = this.evaluator.Evaluate(this.boundTree);
    }
    return this;
  }

  Clear() {
    this.diagnostics.Clear();
  }
}
