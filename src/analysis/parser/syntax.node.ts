import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxTree } from "../../runtime/syntax.tree";
import { SyntaxToken } from "./syntax.token";
import { Span } from "../text/span";

export abstract class SyntaxNode {
  constructor(public tree: SyntaxTree, public kind: SyntaxKind) {}

  abstract getFirstChild(): SyntaxToken<SyntaxKind>;
  abstract getLastChild(): SyntaxToken<SyntaxKind>;

  hasTrivia() {
    this.getFirstChild().trivia.length > 0;
  }

  get span() {
    const startPosition = this.getFirstChild().span.start;
    const endPosition = this.getLastChild().span.end;
    return Span.createFrom(this.tree.sourceText, startPosition, endPosition);
  }

  get text() {
    const startPosition = this.getFirstChild().span.start;
    const endPosition = this.getLastChild().span.end;
    return this.tree.sourceText.get(startPosition, endPosition);
  }
}
