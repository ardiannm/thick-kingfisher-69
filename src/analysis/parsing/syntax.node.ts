import { TextSpan } from "../../lexing/text.span";
import { SourceText } from "../../lexing/source.text";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxToken } from "./syntax.token";

export abstract class SyntaxNode {
  constructor(public sourceText: SourceText, public kind: SyntaxKind) {}

  abstract getFirstChild(): SyntaxToken;
  abstract getLastChild(): SyntaxToken;

  hasTrivia() {
    return this.getFirstChild().trivias.length > 0;
  }

  get span() {
    return TextSpan.createFrom(this.sourceText, this.getFirstChild().span.start, this.getLastChild().span.end, 0);
  }

  get fullSpan() {
    return TextSpan.createFrom(this.sourceText, this.getFirstChild().fullSpan.start, this.getLastChild().fullSpan.end, 0);
  }

  get text() {
    return this.sourceText.text.substring(this.span.start, this.span.end);
  }
}
