import { SyntaxKind } from "./SyntaxKind";

// SyntaxNode class representing a node in the syntax tree.
export class SyntaxNode {
  // Constructor that takes a SyntaxKind representing the type of the syntax node.
  constructor(public Kind: SyntaxKind) {}

  // Yielding Branches and Branches Within Arrays
  *GetBranch() {
    for (const Branch of Object.values(this)) {
      if (Array.isArray(Branch)) {
        for (const InnerBranch of Branch) yield InnerBranch;
        continue;
      }
      if (Branch instanceof SyntaxNode) {
        yield Branch;
      }
    }
  }
}
