import { SyntaxToken } from "./SyntaxToken";
import { BoundNode } from "../Binder/BoundNode";
import { RgbColor } from "../../Text/RgbColor";
import { SyntaxNode } from "./SyntaxNode";

export class SyntaxTree {
  private constructor(public Root: BoundNode) {}

  static Print(Node: SyntaxNode, Indent = "") {
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
}
