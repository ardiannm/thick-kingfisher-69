import { SyntaxKind } from "./SyntaxKind";
import { BranchNode } from "./BranchNode";

// SyntaxNode class representing a node in the syntax tree.

export class SyntaxNode {
  // Constructor that takes a SyntaxKind representing the type of the syntax node.
  constructor(public Kind: SyntaxKind) {}

  // Generator function to get children of the syntax node.
  public *GetBranches() {
    // Get all properties of the object and filter for instances of SyntaxNode.
    const Branches = Object.keys(this)
      .map((key) => this[key])
      .filter((value) => value instanceof SyntaxNode);

    // Yield SyntaxBranch objects for each child, indicating if it's the last child.
    for (let i = 0; i < Branches.length; i++) {
      yield new BranchNode(Branches[i], i + 1 === Branches.length);
    }
  }
}
