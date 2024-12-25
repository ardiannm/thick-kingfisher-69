import { SourceText } from "./source.text";
import { Span } from "./span";
import { Kind, SyntaxKind } from "../parsing/syntax.kind";
import { SyntaxNode } from "../parsing/syntax.node";

export class SyntaxToken<K extends Kind = Kind> extends SyntaxNode {
  constructor(public override source: SourceText, public override kind: K, private textSpan: Span) {
    super(source, kind);
  }

  override hasTrivia(): boolean {
    const leftPosition = this.span.start - 1;
    if (this.isTrivia() || leftPosition - 1 < 0) {
      return false;
    }
    return this.source.getToken(leftPosition).isTrivia();
  }

  get position() {
    return this.source.getTokenPosition(this.span.start);
  }

  override get span() {
    return this.textSpan;
  }

  override get fullSpan() {
    if (this.isTrivia()) {
      return this.textSpan;
    }
    let position = this.position;
    const tokens = this.source.tokens;
    while (position > 0 && tokens[position - 1].isTrivia()) {
      position--;
    }
    if (position === this.position) {
      return this.textSpan;
    }
    return Span.createFrom(this.source, tokens[position].span.start, this.span.end);
  }

  override getFirstChild() {
    return this;
  }

  override getLastChild() {
    return this;
  }

  isTrivia() {
    switch (this.kind) {
      case SyntaxKind.LineBreakTrivia:
      case SyntaxKind.SpaceTrivia:
      case SyntaxKind.CommentTrivia:
      case SyntaxKind.BadToken:
        return true;
      default:
        return false;
    }
  }

  isMultiLine() {
    switch (this.kind) {
      case SyntaxKind.CommentTrivia:
        return true;
      default:
        return false;
    }
  }

  isPunctuation() {
    switch (this.kind) {
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
      case SyntaxKind.SlashToken:
      case SyntaxKind.StarToken:
      case SyntaxKind.HatToken:
      case SyntaxKind.OpenParenthesisToken:
      case SyntaxKind.CloseParenthesisToken:
      case SyntaxKind.OpenBraceToken:
      case SyntaxKind.CloseBraceToken:
      case SyntaxKind.ColonColonToken:
      case SyntaxKind.ColonToken:
      case SyntaxKind.SpaceTrivia:
        return true;
      default:
        return false;
    }
  }

  override get class() {
    return this.kind
      .toString()
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\s/g, "-")
      .toLowerCase();
  }
}
