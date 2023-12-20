import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

import crc32 from "crc32";

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

  get ObjectId(): string {
    if (this instanceof SyntaxToken) return crc32(this.Text);
    var ObjectId = "";
    for (const Branch of this.GetBranches()) ObjectId = crc32(ObjectId + Branch.ObjectId);
    return ObjectId;
  }

  get SourceText(): string {
    if (this instanceof SyntaxToken) return this.Text;
    var Text = "";
    for (const Branch of this.GetBranches()) Text += Branch.SourceText;
    return Text;
  }
}
