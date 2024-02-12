import { SyntaxNode } from "./SyntaxNode";
import { Submission } from "../../Input/Submission";
import { Parser } from "../Parser";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { Binder } from "../Binder";
import { BoundNode } from "../Binding/BoundNode";
import { BoundNumericLiteral } from "../Binding/BoundNumericLiteral";
import { BoundKind } from "../Binding/Kind/BoundKind";
import { Evaluator } from "../../Evaluator";
import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { CompilerOptions } from "../../CompilerOptions";

export class SyntaxTree {
  private EvaluatorService: Evaluator;
  private Tree: SyntaxNode;
  private BoundTree: BoundNode;

  BinderService: Binder;

  Value = 0;

  private constructor(public Diagnostics: DiagnosticBag, private Options: CompilerOptions) {
    this.BinderService = new Binder(this.Diagnostics, this.Options);
    this.EvaluatorService = new Evaluator(this.Diagnostics);
    this.Tree = new SyntaxNode(SyntaxNodeKind.BadToken);
    this.BoundTree = new BoundNumericLiteral(BoundKind.NumericLiteral, 0) as BoundNode;
  }

  static Init(Options: CompilerOptions) {
    const Diagnostics = new DiagnosticBag();
    return new SyntaxTree(Diagnostics, Options);
  }

  Parse(Text: string) {
    const Input = Submission.From(Text);
    const ParserService = new Parser(Input, this.Diagnostics);
    this.Tree = ParserService.Parse();
    return this;
  }

  Bind() {
    if (this.Diagnostics.None()) {
      this.BoundTree = this.BinderService.Bind(this.Tree);
    }
    return this;
  }

  Evaluate() {
    if (this.Diagnostics.None()) {
      this.Value = this.EvaluatorService.Evaluate(this.BoundTree);
    }

    return this;
  }

  Print() {
    console.log(this.Tree.Print());
    return this;
  }

  Clear() {
    this.Diagnostics.Clear();
  }
}
