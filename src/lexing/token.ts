import { Kind, SyntaxKind } from "../analysis/parsing/syntax.kind";
import { TextSpan } from "./text.span";

export class Token<T extends Kind = Kind> {
  constructor(public kind: T, public span: TextSpan) {}

  static isTrivia(kind: Kind) {
    switch (kind) {
      case SyntaxKind.LineBreakTrivia:
      case SyntaxKind.SpaceTrivia:
      case SyntaxKind.CommentTrivia:
        return true;
      default:
        return false;
    }
  }
}
