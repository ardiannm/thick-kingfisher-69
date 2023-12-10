import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

import crc32 from "crc32";

// SyntaxNode class representing a node in the syntax tree.
export abstract class SyntaxNode {
  // Constructor that takes a SyntaxKind representing the type of the syntax node.
  constructor(public Kind: SyntaxKind) {}

  // Yielding Branches and Branches Within Arrays
  *GetBranches(): Generator<SyntaxNode> {
    for (const Branch of Object.values(this)) {
      if (Array.isArray(Branch)) {
        for (const InnerBranch of Branch) yield InnerBranch;
      } else if (Branch instanceof SyntaxNode) {
        yield Branch;
      }
    }
  }

  get ObjectId() {
    if (this instanceof SyntaxToken) return crc32(this.Text);
    var ObjectId = "";
    for (const Branch of this.GetBranches()) ObjectId = crc32(ObjectId + Branch.ObjectId);
    return ObjectId;
  }
}
