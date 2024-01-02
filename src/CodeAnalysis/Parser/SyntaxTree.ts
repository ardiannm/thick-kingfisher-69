import { Parser } from "./Parser";
import { SyntaxToken } from "./SyntaxToken";
import { BoundNode } from "../Binder/BoundNode";
import { Lowerer } from "../Lowerer/Lowerer";
import { Program } from "./Program";
import { RgbColor } from "../../Text/RgbColor";
import { SourceText } from "../../Text/SourceText";
import { SyntaxNode } from "./SyntaxNode";

export class SyntaxTree {
  private constructor(public Root: BoundNode) {}

  static Parse(Text: string) {
    const Source = SourceText.From(Text);
    return new Parser(Source).Parse() as Program;
  }

  static Lower(Text: string) {
    return new Lowerer().Lower(SyntaxTree.Parse(Text)) as Program;
  }

  static Print(Node: SyntaxNode | BoundNode, Indent = "") {
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
        return Text;
      }
    }
    if (Node instanceof BoundNode) {
      const Branches = Array.from(Node.GetBranches());
      for (const [Index, Branch] of Branches.entries()) {
        const LastBranch = Index + 1 == Branches.length;
        const Lead = LastBranch ? "└── " : "├── ";
        Text += "\n" + Indent + Lead + this.Print(Branch, Indent + (LastBranch ? "   " : "│  "));
      }
      return Text;
    }
    return Text;
  }
}
