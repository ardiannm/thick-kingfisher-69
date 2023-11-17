import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";

export class SyntaxToken extends SyntaxNode {
  constructor(public Node: SyntaxKind, public Text: string) {
    super(Node);
  }
}
