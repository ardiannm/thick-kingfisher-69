import { SyntaxChildNode } from "./SyntaxChildNode";
import { SyntaxKind } from "./SyntaxKind";

// SyntaxNode class representing a node in the syntax tree.

export class SyntaxNode {
  // Constructor that takes a SyntaxKind representing the type of the syntax node.
  constructor(public Kind: SyntaxKind) {}

  // Generator function to get children of the syntax node.
  public *GetChildren() {
    // Get all properties of the object and filter for instances of SyntaxNode.
    const Children = Object.keys(this)
      .map((key) => this[key])
      .filter((value) => value instanceof SyntaxNode);

    // Yield SyntaxChildNode objects for each child, indicating if it's the last child.
    for (let i = 0; i < Children.length; i++) {
      yield new SyntaxChildNode(Children[i], i + 1 === Children.length);
    }
  }
}
