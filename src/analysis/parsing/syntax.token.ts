import { SourceText } from "../../lexing/source.text";
import { Span } from "../../lexing/span";
import { SyntaxKeywordKind } from "./kind/syntax.keyword.kind";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxTriviaKind } from "./kind/syntax.trivia.kind";
import { SyntaxNode } from "./syntax.node";

export class SyntaxToken<T extends SyntaxKind = SyntaxKind> extends SyntaxNode {
  public trivias = [] as SyntaxToken[];

  constructor(public override text: SourceText, public override kind: T, private textSpan: Span) {
    super(text, kind);
  }

  override hasTrivia(): boolean {
    return this.trivias.length > 0;
  }

  override get span() {
    return this.textSpan;
  }

  override getFirstChild() {
    return this;
  }

  override getLastChild() {
    return this;
  }

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
