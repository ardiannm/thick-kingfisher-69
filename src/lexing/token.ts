import { Span } from "./span";
import { SyntaxKeywordKind } from "../analysis/parsing/kind/syntax.keyword.kind";
import { SyntaxKind } from "../analysis/parsing/kind/syntax.kind";
import { SyntaxNodeKind } from "../analysis/parsing/kind/syntax.node.kind";
import { SyntaxTriviaKind } from "../analysis/parsing/kind/syntax.trivia.kind";

export class Token<T extends SyntaxKind = SyntaxKind> {
  constructor(public kind: T, public span: Span) {}

  static isTrivia(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxTriviaKind.LineBreakTrivia:
      case SyntaxTriviaKind.SpaceTrivia:
      case SyntaxTriviaKind.CommentTrivia:
      case SyntaxTriviaKind.MultilineCommentTrivia:
        return true;
      default:
        return false;
    }
  }

  static isKeywordOrIdentifer(text: string): SyntaxKind {
    switch (text) {
      case "true":
        return SyntaxKeywordKind.TrueKeyword;
      case "false":
        return SyntaxKeywordKind.FalseKeyword;
      default:
        return SyntaxNodeKind.IdentifierToken;
    }
  }
}
