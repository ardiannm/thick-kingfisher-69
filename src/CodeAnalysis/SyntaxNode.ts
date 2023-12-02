import { SyntaxChildNode } from "./SyntaxChildNode";
import { SyntaxKind } from "./SyntaxKind";

export class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}

  public *GetChildren() {
    const Children = Object.keys(this)
      .map((key) => this[key])
      .filter((value) => value instanceof SyntaxNode);

    for (let i = 0; i < Children.length; i++) {
      yield new SyntaxChildNode(Children[i], i + 1 === Children.length);
    }
  }
}
