import { SyntaxKind } from "./SyntaxKind";
import { BranchNode } from "./BranchNode";
import { SyntaxToken } from "./SyntaxToken";

import { v3 } from "murmurhash";

// SyntaxNode class representing a node in the syntax tree.
export class SyntaxNode {
  // Constructor that takes a SyntaxKind representing the type of the syntax node.
  constructor(public Kind: SyntaxKind) {}

  // Generator function to get children of the syntax node.
  public *GetBranches() {
    // Array to store child nodes (branches).
    const Branches = new Array<SyntaxNode>();

    // Iterate over properties of the current node.
    for (const Branch of Object.values(this)) {
      // Check if the property is an instance of SyntaxNode.
      if (Branch instanceof SyntaxNode) {
        Branches.push(Branch as SyntaxNode);
        continue;
      }

      // Check if the property is an array of SyntaxNodes.
      if (Array.isArray(Branch)) {
        for (const Item of Branch) {
          // If it's an instance of SyntaxNode, add it to the Branches array.
          if (Item instanceof SyntaxNode) Branches.push(Item as SyntaxNode);
        }
        continue;
      }
    }

    // Yield SyntaxBranch objects for each child, indicating if it's the last child.
    for (let i = 0; i < Branches.length; i++) {
      yield new BranchNode(Branches[i], i + 1 === Branches.length);
    }
  }

  // Get ObjectId based on hashing the node's properties and child node properties.
  get ObjectId(): string {
    let ObjectId = "";

    if (this instanceof SyntaxToken) {
      ObjectId = v3(this.Text).toString();
    }

    // Iterate over child nodes and update ObjectId based on their hashed values.
    for (const Branch of this.GetBranches()) {
      ObjectId = v3(ObjectId + Branch.Node.ObjectId).toString();
    }

    // Return the final ObjectId as a formatted string.
    return `Object('${ObjectId}')`;
  }
}
