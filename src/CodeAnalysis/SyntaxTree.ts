import { Expression } from "./Expression";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";

export class SyntaxTree extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Root: Array<Expression>) {
    super(Kind);
  }
  public Print(Node: SyntaxNode = this, Indentation = "") {
    var Text = "";
    for (const Child of Node.GetChildren()) {
      var Kind = Child.Node.Kind + "";
      if (Child.isLast) {
        Text += Indentation + "└── " + Kind + "\n" + this.Print(Child.Node, Indentation + "    ");
      } else {
        Text += Indentation + "├── " + Kind + "\n" + this.Print(Child.Node, Indentation + "│   ");
      }
    }
    return Text;
  }
}
