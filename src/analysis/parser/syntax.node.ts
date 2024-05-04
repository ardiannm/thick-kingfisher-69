import { TokenSpan } from "../input/token.span";
import { SyntaxKind } from "./kind/syntax.kind";

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

  get Span(): TokenSpan {
    const FirstSpan = this.First().Span;
    return FirstSpan.Input.SetTokenSpan(FirstSpan.Start, this.Last().Span.End);
  }
}
