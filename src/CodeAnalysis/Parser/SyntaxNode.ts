import { TextSpan } from "../../Text/TextSpan";
import { SyntaxKind } from "./Kind/SyntaxKind";

export class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}

  *Children(): Generator<SyntaxNode> {
    for (const Node of Object.values(this)) {
      if (Array.isArray(Node)) {
        for (const InnerNode of Node) {
          yield InnerNode;
        }
      } else if (Node instanceof SyntaxNode) {
        yield Node;
      }
    }
  }

  First(): SyntaxNode {
    return (this.Children().next().value as SyntaxNode).First();
  }

  Last() {
    var LastNode: SyntaxNode = this.First();
    for (const Node of this.Children()) LastNode = Node.Last();
    return LastNode;
  }

  TextSpan(): TextSpan {
    const FirstSpan = this.First().TextSpan();
    return FirstSpan.Input.CreateTextSpan(FirstSpan.Start, this.Last().TextSpan().End);
  }
}
