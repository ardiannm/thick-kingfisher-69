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

export class SyntaxTree {
  private binder = new Binder(this.diagnostics);
  private constructor(public diagnostics: DiagnosticBag) {}

  public tree: SyntaxNode = new SyntaxToken(SyntaxKind.EndOfFileToken, "");
  public bound: BoundNode = new BoundNumericLiteral(BoundKind.NumericLiteral, 0);

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

  ParseName(row: number, column: number) {
    return this.ColumnIndexToLetter(column) + row;
  }

  GetCell(Name: string) {
    return this.binder.Scope.GetCell(Name);
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

  Bind() {
    if (this.diagnostics.Any()) {
      this.diagnostics.ParserErrors();
    } else {
      this.bound = this.binder.Bind(this.tree);
    }
    return this;
  }

  Print() {
    console.log(SyntaxTree.Print(this.tree));
    return this;
  }
}
