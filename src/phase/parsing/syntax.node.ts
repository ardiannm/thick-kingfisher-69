import { SourceText } from "../lexing/source.text";
import { Span } from "../lexing/span";
import { Kind } from "./syntax.kind";
import { SyntaxToken } from "./syntax.token";

export abstract class SyntaxNode<K extends Kind = Kind> {
  constructor(public source: SourceText, public kind: K) {}

  abstract getFirstChild(): SyntaxToken;
  abstract getLastChild(): SyntaxToken;

  hasTrivia() {
    const trivias = this.getFirstChild().trivias;
    return !!trivias?.length;
  }

  get span() {
    return Span.createFrom(this.source, this.getFirstChild().span.start, this.getLastChild().span.end);
  }

  get fullSpan() {
    return Span.createFrom(this.source, this.getFirstChild().fullSpan.start, this.getLastChild().fullSpan.end);
  }

  get class() {
    return this.kind
      .toString()
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\s/g, "-")
      .toLowerCase();
  }
}
