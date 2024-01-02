import { BoundKind } from "./BoundKind";

export abstract class BoundNode {
  constructor(public Kind: BoundKind) {}

  *GetBranches(): Generator<BoundNode> {
    for (const Branch of Object.values(this)) {
      if (Array.isArray(Branch)) {
        for (const InnerBranch of Branch) yield InnerBranch;
      } else if (Branch instanceof BoundNode) {
        yield Branch;
      }
    }
  }
}
