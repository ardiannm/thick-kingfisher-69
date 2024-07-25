import { TokenSpan } from "../text/token.span";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxTree } from "../../runtime/syntax.tree";

export class SyntaxNode {
  constructor(public tree: SyntaxTree, public kind: SyntaxKind) {}

  *getChildren(): Generator<SyntaxNode> {
    for (const data of Object.values(this)) {
      if (Array.isArray(data)) for (const iteration of data) yield iteration;
      if (data instanceof SyntaxNode) yield data;
    }
  }

  getFirstChild(): SyntaxNode {
    return this.getChildren().next().value as SyntaxNode;
  }

  getLastChild(): SyntaxNode {
    var lastNode: SyntaxNode = this.getFirstChild();
    for (const node of this.getChildren()) lastNode = node;
    return lastNode;
  }

  getSpan(): TokenSpan {
    return TokenSpan.createFrom(this.getFirstChild().getSpan().start, this.getLastChild().getSpan().end);
  }

  getText(): string {
    var text = "";
    for (const child of this.getChildren()) text += this.tree.text.get(child.getSpan().start, child.getSpan().end);
    return text;
  }
}
