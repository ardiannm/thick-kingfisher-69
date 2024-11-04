import { SourceText } from "../../lexing/source.text";
import { Span } from "../../lexing/span";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxToken } from "./syntax.token";

export abstract class SyntaxNode {
  constructor(public text: SourceText, public kind: SyntaxKind) {}

  abstract getFirstChild(): SyntaxToken;
  abstract getLastChild(): SyntaxToken;

  hasTrivia() {
    this.getFirstChild().trivias.length > 0;
  }

  get span() {
    return Span.createFrom(this.getFirstChild().span.start, this.getLastChild().span.end);
  }

  get getText() {
    return this.text.source.substring(this.span.start, this.span.end);
  }
}
