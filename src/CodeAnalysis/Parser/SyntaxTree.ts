import { SyntaxToken } from "./SyntaxToken";
import { RgbColor } from "../../Text/RgbColor";
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

export class SyntaxTree {
  private tree: SyntaxNode = new SyntaxNode(SyntaxNodeKind.BadToken);
  private bound: BoundNode = new BoundNumericLiteral(BoundKind.NumericLiteral, 0);

  private evaluator = new Evaluator();

  private binder: Binder;
  value: number = 0;

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
    var Text = "";
    if (Node instanceof SyntaxToken) {
      for (const Trivia of Node.Trivia) {
        Text += RgbColor.Lavender("[" + Trivia.Kind + "]") + " ";
      }
      Text += RgbColor.Turquoise(Node.Kind) + " " + RgbColor.Lavender('"' + Node.Text + '"');
      return Text;
    }
    if (Node instanceof SyntaxNode) {
      Text += RgbColor.Azure(Node.Kind);
      for (const Child of Node.Children()) {
        Text += "\n" + Indent;
        const Last = Child === Node.Last();
        if (Last) {
          Text += RgbColor.Azure("└── ") + this.Print(Child, Indent + "   ");
        } else {
          Text += RgbColor.Azure("├── ") + this.Print(Child, Indent + RgbColor.Azure("│  "));
        }
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

  TextSpan() {
    if (this.diagnostics.None()) {
      console.log(RgbColor.Azure(this.tree.TextSpan().Get()));
    }
    return this;
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

  PrintTree() {
    console.log(SyntaxTree.Print(this.tree));
    return this;
  }

  PrintBound() {
    console.log(JSON.stringify(this.bound, undefined, 3));
    return this;
  }
}
