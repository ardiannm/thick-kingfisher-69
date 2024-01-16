import { Painter } from "../../Text/Painter";
import { TextSpan } from "../../Text/TextSpan";
import { SyntaxKind } from "./Kind/SyntaxKind";

export class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}

  *Children(): Generator<SyntaxNode> {
    for (const Data of Object.values(this)) {
      if (Array.isArray(Data)) for (const Iteration of Data) yield Iteration;
      if (Data instanceof SyntaxNode) yield Data;
    }
  }

  First(): SyntaxNode {
    return this.Children().next().value as SyntaxNode;
  }

  Last() {
    var LastNode: SyntaxNode = this.First();
    for (const Node of this.Children()) LastNode = Node;
    return LastNode;
  }

  TextSpan(): TextSpan {
    const FirstSpan = this.First().TextSpan();
    return FirstSpan.Input.CreateTextSpan(FirstSpan.Start, this.Last().TextSpan().End);
  }

  Print(Indent = "") {
    var Text = Painter.Sandstone(this.Kind);
    for (const Child of this.Children()) {
      Text += "\n" + Indent;
      if (Child === this.Last()) {
        Text += Painter.Gray("└── ") + Child.Print(Indent + "   ");
      } else {
        Text += Painter.Gray("├── ") + Child.Print(Indent + Painter.Gray("│  "));
      }
    }
    return Text;
  }
}
