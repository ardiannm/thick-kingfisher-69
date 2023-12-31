import { SyntaxKind } from "./SyntaxKind";

export abstract class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}

  *GetBranches(): Generator<SyntaxNode> {
    for (const Branch of Object.values(this)) {
      if (Array.isArray(Branch)) {
        for (const InnerBranch of Branch) yield InnerBranch;
      } else if (Branch instanceof SyntaxNode) {
        yield Branch;
      }
    }
  }
}
