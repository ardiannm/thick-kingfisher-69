import { SyntaxNode } from "./SyntaxNode";
import { SourceText } from "../../Text/SourceText";
import { Parser } from "./Parser";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { Binder } from "../Binder/Binder";
import { BoundNode } from "../Binder/BoundNode";
import { BoundNumericLiteral } from "../Binder/BoundNumericLiteral";
import { BoundKind } from "../Binder/Kind/BoundKind";
import { Evaluator } from "../../Evaluator";
import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { CompilerOptions } from "../../CompilerOptions/CompilerOptions";

export class SyntaxTree {
  private tree = new SyntaxNode(SyntaxNodeKind.BadToken);
  private bound = new BoundNumericLiteral(BoundKind.NumericLiteral, 0) as BoundNode;

  private binder: Binder;
  private evaluator: Evaluator;

  value: number = 0;

  private constructor(public diagnostics: DiagnosticBag, private compilerOptions: CompilerOptions) {
    this.binder = new Binder(this.diagnostics, this.compilerOptions);
    this.evaluator = new Evaluator(this.diagnostics);
  }

  ParseName(row: number, column: number) {
    return this.ColumnIndexToLetter(column) + row;
  }

  GetCell(Name: string) {
    return this.binder.Scope.GetCell(Name);
  }

  private ColumnIndexToLetter(column: number): string {
    let name = "";
    while (column > 0) {
      const remainder = (column - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      column = Math.floor((column - 1) / 26);
    }
    return name;
  }

  static Init(compilerOptions: CompilerOptions) {
    const diagnostics = new DiagnosticBag();
    return new SyntaxTree(diagnostics, compilerOptions);
  }

  Parse(text: string) {
    const input = SourceText.From(text);
    const parser = new Parser(input, this.diagnostics);
    this.tree = parser.Parse();
    return this;
  }

  Bind() {
    if (this.diagnostics.None()) {
      this.bound = this.binder.Bind(this.tree);
    }
    return this;
  }

  Evaluate() {
    if (this.diagnostics.None()) {
      this.value = this.evaluator.Evaluate(this.bound);
    }
    return this;
  }

  Clear() {
    this.diagnostics.Clear();
    return this;
  }

  get Count() {
    return this.binder.Scope.Count;
  }

  Log() {
    console.log(this.tree.Print());
    return this;
  }
}
