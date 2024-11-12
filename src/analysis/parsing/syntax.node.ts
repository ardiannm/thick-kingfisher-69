import { Span } from "../../lexing/span";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxToken } from "./syntax.token";

export abstract class SyntaxNode {
  constructor(public kind: SyntaxKind) {}

  abstract getFirstChild(): SyntaxToken;
  abstract getLastChild(): SyntaxToken;

  hasTrivia() {
    return this.getFirstChild().trivias.length > 0;
  }

  get span() {
    return Span.createFrom(this.getFirstChild().span.start, this.getLastChild().span.end);
  }

  get fullSpan() {
    return Span.createFrom(this.getFirstChild().fullSpan.start, this.getLastChild().fullSpan.end);
  }
}
