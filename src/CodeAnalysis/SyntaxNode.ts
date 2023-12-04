import { SyntaxKind } from "./SyntaxKind";
import { SyntaxBranch } from "./SyntaxBranch";

// SyntaxNode class representing a node in the syntax tree.

export class SyntaxNode {
  // Constructor that takes a SyntaxKind representing the type of the syntax node.
  constructor(public Kind: SyntaxKind) {}

  // Generator function to get children of the syntax node.
  public *GetBranches() {
    // Get all properties of the object and filter for instances of SyntaxNode.
    const Children = Object.keys(this)
      .map((key) => this[key])
      .filter((value) => value instanceof SyntaxNode);

    // Yield SyntaxBranch objects for each child, indicating if it's the last child.
    for (let i = 0; i < Children.length; i++) {
      yield new SyntaxBranch(Children[i], i + 1 === Children.length);
    }
  }
}
