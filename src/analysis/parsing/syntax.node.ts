import { Span } from "../../lexing/span";
import { SyntaxTree } from "../../syntax.tree";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxToken } from "./syntax.token";

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
    return this.tree.sourceText.getText(startPosition, endPosition);
  }
}
