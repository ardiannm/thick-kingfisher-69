import { Kind, SyntaxKind } from "../analysis/parsing/syntax.kind";
import { Span } from "./span";

export class Token<T extends Kind = Kind> {
  constructor(public kind: T, public span: Span) {}

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

  get class() {
    return this.kind
      .toString()
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\s/g, "-")
      .toLowerCase();
  }
}
