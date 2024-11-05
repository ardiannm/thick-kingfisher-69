import { Span } from "../../lexing/span";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxToken } from "./syntax.token";

export abstract class SyntaxNode {
  constructor(public kind: SyntaxKind) {}

  abstract getFirstChild(): SyntaxToken;
  abstract getLastChild(): SyntaxToken;

  hasTrivia() {
    this.getFirstChild().trivias.length > 0;
  }

  get span() {
    const start = this.getFirstChild();
    const end = this.getLastChild();
    return Span.createFrom(start.span.start, end.span.end, start.span.text);
  }

  getText() {
    return this.span.text.source.substring(this.span.start, this.span.end);
  }
}
