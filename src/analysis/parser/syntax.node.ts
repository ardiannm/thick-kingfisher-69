import { Span } from "../input/token.span";
import { SyntaxKind } from "./kind/syntax.kind";

export class SyntaxNode {
  constructor(public kind: SyntaxKind) {}

  *Children(): Generator<SyntaxNode> {
    for (const data of Object.values(this)) {
      if (Array.isArray(data)) for (const iteration of data) yield iteration;
      if (data instanceof SyntaxNode) yield data;
    }
  }

  First(): SyntaxNode {
    return this.Children().next().value as SyntaxNode;
  }

  Last() {
    var lastNode: SyntaxNode = this.First();
    for (const node of this.Children()) lastNode = node;
    return lastNode;
  }

  GetSpan(): Span {
    const firstSpan = this.First().GetSpan();
    return firstSpan.input.SetTokenSpan(firstSpan.start, this.Last().GetSpan().end);
  }
}
