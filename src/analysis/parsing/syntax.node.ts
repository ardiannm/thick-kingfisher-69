import { SourceText } from "../../lexing/source.text";
import { Span } from "../../lexing/span";
import { Kind } from "./syntax.kind";
import { SyntaxToken } from "./syntax.token";

export abstract class SyntaxNode {
  constructor(public sourceText: SourceText, public kind: Kind) {}

  abstract getFirstChild(): SyntaxToken;
  abstract getLastChild(): SyntaxToken;

  hasTrivia() {
    return this.getFirstChild().trivias.length > 0;
  }

  get span() {
    return new Span(this.sourceText, this.getFirstChild().span.start, this.getLastChild().span.end);
  }

  get fullSpan() {
    return new Span(this.sourceText, this.getFirstChild().fullSpan.start, this.getLastChild().fullSpan.end);
  }

  get text() {
    return this.sourceText.text.substring(this.span.start, this.span.end);
  }
}
