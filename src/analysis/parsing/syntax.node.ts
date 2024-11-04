import { Span } from "../../lexing/span";
import { SyntaxTree } from "../../syntax.tree";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxToken } from "./syntax.token";

export abstract class SyntaxNode {
  constructor(public tree: SyntaxTree, public kind: SyntaxKind) {}

  abstract getFirstChild(): SyntaxToken;
  abstract getLastChild(): SyntaxToken;

  hasTrivia() {
    this.getFirstChild().trivias.length > 0;
  }

  get span() {
    return Span.createFrom(this.getFirstChild().span.start, this.getLastChild().span.end);
  }

  get text() {
    return this.tree.text.source.substring(this.span.start, this.span.end);
  }
}
