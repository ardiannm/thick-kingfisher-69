import { TextSpan } from "../input/text.span";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxTree } from "./syntax.tree";

export class SyntaxNode {
  constructor(public tree: SyntaxTree, public kind: SyntaxKind) {}

  *getLeaves(): Generator<SyntaxNode> {
    for (const data of Object.values(this)) {
      if (Array.isArray(data)) for (const iteration of data) yield iteration;
      if (data instanceof SyntaxNode) yield data;
    }
  }

  firstLeaf(): SyntaxNode {
    return this.getLeaves().next().value as SyntaxNode;
  }

  lastLeaf() {
    var lastNode: SyntaxNode = this.firstLeaf();
    for (const node of this.getLeaves()) lastNode = node;
    return lastNode;
  }

  getTextSpan(): TextSpan {
    return TextSpan.from(this.firstLeaf().getTextSpan().start, this.lastLeaf().getTextSpan().end);
  }

  getText(): string {
    return this.tree.getText(this.getTextSpan());
  }
}
