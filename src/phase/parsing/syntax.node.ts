import { SourceText } from "../lexing/source.text";
import { Span } from "../lexing/span";
import { SyntaxKind } from "./syntax.kind";
import { SyntaxToken } from "../lexing/syntax.token";

export abstract class SyntaxNode<K extends SyntaxKind = SyntaxKind> {
  constructor(public source: SourceText, public kind: K) {}

  abstract getFirstChild(): SyntaxToken;
  abstract getLastChild(): SyntaxToken;

  hasTrivia() {
    return this.getFirstChild().hasTrivia();
  }

  get span() {
    return Span.createFrom(this.source, this.getFirstChild().span.start, this.getLastChild().span.end);
  }

  get fullSpan() {
    return Span.createFrom(this.source, this.getFirstChild().fullSpan.start, this.getLastChild().fullSpan.end);
  }

  get class() {
    return SyntaxKind[this.kind]
      .toString()
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\s/g, "-")
      .toLowerCase();
  }

  toJson() {
    const json: Record<string, any> = {};
    json["type"] = this.class;
    for (const [k, v] of Object.entries(this)) {
      if (v instanceof SyntaxNode) {
        json[k] = v.toJson();
      } else if (Array.isArray(v)) {
        json[k] = v.map((node) => node.toJson());
      }
    }
    switch (this.kind) {
      case SyntaxKind.OpenParenthesisToken:
      case SyntaxKind.CloseParenthesisToken:
      case SyntaxKind.IdentifierToken:
      case SyntaxKind.NumberToken:
        json["text"] = this.span.text;
    }
    return json;
  }
}
