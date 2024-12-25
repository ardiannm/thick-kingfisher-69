import { SourceText } from "./source.text";
import { Span } from "./span";
import { Kind, SyntaxKind } from "../parsing/syntax.kind";
import { SyntaxNode } from "../parsing/syntax.node";

// TODO: Add a this.position getter that return the current index position of this token in the SourceText.tokens cache
// ueseful to know where to start from when looking to the left of the token for trivias
export class SyntaxToken<K extends Kind = Kind> extends SyntaxNode {
  constructor(public override source: SourceText, public override kind: K, private textSpan: Span) {
    super(source, kind);
  }

  // TODO: this has to be implemented using SourceText.tokens cache
  override hasTrivia(): boolean {
    const leftPosition = this.span.start - 1;
    if (this.isTrivia() || leftPosition - 1 < 0) {
      return false;
    }
    const leftToken = this.source.getToken(leftPosition);
    return leftToken.isTrivia();
  }

  get position() {
    return this.source.getTokenPosition(this.span.start);
  }

  override get span() {
    return this.textSpan;
  }

  // TODO: use the most to the left trivia to find the starting position for a full span
  override get fullSpan() {
    // const start = !!this.trivias?.length ? this.trivias[0].span.start : this.span.start;
    return Span.createFrom(this.source, this.span.start, this.span.end);
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
