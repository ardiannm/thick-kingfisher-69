import { Parser } from "./Parser";
import { SyntaxToken } from "./SyntaxToken";
import { SourceText } from "../../SourceText";
import { BoundNode } from "../Binder/BoundNode";
import { Lowerer } from "../Lowerer/Lowerer";
import { SyntaxNode } from "./SyntaxNode";
import { RgbColor } from "../Interpreter/RgbColor";
import { Program } from "./Program";

export class SyntaxTree {
  private constructor(public Root: BoundNode) {}

  static Parse(Text: string) {
    const Source = SourceText.From(Text);
    return new Parser(Source).Parse() as Program;
  }

  static Lower(Text: string) {
    return new Lowerer().Lower(SyntaxTree.Parse(Text)) as Program;
  }

  static Print(Node: SyntaxNode, Indent = "") {
    let Text = "";
    Text += RgbColor.Sandstone(Node.Kind);
    if (Node instanceof SyntaxToken) {
      return Text + " " + RgbColor.Terracotta(Node.Text);
    }
    if (Node instanceof SyntaxNode) {
      const Branches = Array.from(Node.GetBranches());
      for (const [Index, Branch] of Branches.entries()) {
        const LastBranch = Index + 1 == Branches.length;
        const Lead = LastBranch ? "└── " : "├── ";
        Text += "\n" + RgbColor.Terracotta(Indent + Lead) + this.Print(Branch, Indent + (LastBranch ? "   " : "│  "));
      }
    }
    return Text;
  }
}
