import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

export abstract class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}

  *GetChildren(): Generator<SyntaxNode> {
    for (const Node of Object.values(this)) {
      if (Array.isArray(Node)) {
        for (const InnerNode of Node) {
          yield InnerNode;
        }
      } else if (Node instanceof SyntaxToken) {
        for (const Trivia of Node.Trivia) {
          yield Trivia;
        }
        yield Node;
      } else if (Node instanceof SyntaxNode) {
        yield Node;
      }
    }
  }
}
