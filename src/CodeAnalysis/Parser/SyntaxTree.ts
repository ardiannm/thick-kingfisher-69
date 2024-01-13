import { SyntaxToken } from "./SyntaxToken";
import { RgbColor } from "../../Text/RgbColor";
import { SyntaxNode } from "./SyntaxNode";
import { SourceText } from "../../Text/SourceText";
import { Parser } from "./Parser";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { Binder } from "../Binder/Binder";
import { SyntaxKind } from "./SyntaxKind";
import { BoundNode } from "../Binder/BoundNode";
import { BoundNumericLiteral } from "../Binder/BoundNumericLiteral";
import { BoundKind } from "../Binder/BoundKind";
import { Lowerer } from "../Lowerer/Lowerer";
import { Evaluator } from "../../Evaluator";

export class SyntaxTree {
  private tree: SyntaxNode = new SyntaxToken(SyntaxKind.EndOfFileToken, "");
  private bound: BoundNode = new BoundNumericLiteral(BoundKind.NumericLiteral, 0);

  private lowerer = new Lowerer();
  private evaluator = new Evaluator();

  private binder: Binder;

  private constructor(public diagnostics: DiagnosticBag) {
    this.binder = new Binder(this.diagnostics);
  }

  ParseName(row: number, column: number) {
    return this.ColumnIndexToLetter(column) + row;
  }

  GetCell(Name: string) {
    return this.binder.Scope.GetCell(Name);
  }

  private static Print(Node: SyntaxNode, Indent = "") {
    let Text = "";
    Text += RgbColor.Teal(Node.Kind);
    if (Node instanceof SyntaxToken) {
      return Text + " " + Node.Text;
    }
    if (Node instanceof SyntaxNode) {
      const Branches = Array.from(Node.GetBranches());
      for (const [Index, Branch] of Branches.entries()) {
        const LastBranch = Index + 1 == Branches.length;
        const Lead = LastBranch ? "└── " : "├── ";
        Text += "\n" + Indent + Lead + this.Print(Branch, Indent + (LastBranch ? "   " : "│  "));
      }
    }
    return Text;
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

  static Init() {
    const diagnostics = new DiagnosticBag();
    return new SyntaxTree(diagnostics);
  }

  Parse(text: string) {
    const input = SourceText.From(text);
    const parser = new Parser(input, this.diagnostics);
    this.tree = parser.Parse();
    return this;
  }

  Lower() {
    if (this.diagnostics.None()) {
      this.tree = this.lowerer.Lower(this.tree);
    }
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
      this.evaluator.Evaluate(this.bound);
    }
    return this;
  }

  Print() {
    console.log(SyntaxTree.Print(this.tree));
    return this;
  }

  Clear() {
    this.diagnostics.Clear();
    return this;
  }
}
