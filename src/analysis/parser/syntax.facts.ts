import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { BinaryOperatorKind } from "./kind/binary.operator.kind";
import { SyntaxUnaryOperatorKind } from "./kind/syntax.unary.operator.kind";
import { SyntaxKeywordKind } from "./kind/syntax.keyword.kind";
import { SyntaxTriviaKind } from "./kind/syntax.trivia.kind";

export class SyntaxFacts {
  static unaryPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxUnaryOperatorKind.PlusToken:
      case SyntaxUnaryOperatorKind.MinusToken:
        return 3;
      default:
        return 0;
    }
  }

  static binaryPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case BinaryOperatorKind.HatToken:
        return 3;
      case BinaryOperatorKind.StarToken:
      case BinaryOperatorKind.SlashToken:
        return 2;
      case BinaryOperatorKind.PlusToken:
      case BinaryOperatorKind.MinusToken:
        return 1;
      default:
        return 0;
    }
  }

  static syntaxKind(text: string): SyntaxKind {
    switch (text) {
      case "+":
        return BinaryOperatorKind.PlusToken;
      case "-":
        return BinaryOperatorKind.MinusToken;
      case "*":
        return BinaryOperatorKind.StarToken;
      case "/":
        return BinaryOperatorKind.SlashToken;
      case "^":
        return BinaryOperatorKind.HatToken;
      case ":":
        return SyntaxNodeKind.ColonToken;
      case "(":
        return SyntaxNodeKind.OpenParenthesisToken;
      case ")":
        return SyntaxNodeKind.CloseParenthesisToken;
      case "{":
        return SyntaxNodeKind.OpenBraceToken;
      case "}":
        return SyntaxNodeKind.CloseBraceToken;
      case ".":
        return SyntaxNodeKind.DotToken;
      case "#":
        return SyntaxNodeKind.HashToken;
      case ">":
        return SyntaxNodeKind.GreaterToken;
      case "=":
        return SyntaxNodeKind.EqualsToken;
      case "\n":
        return SyntaxTriviaKind.LineBreakTrivia;
      case "":
        return SyntaxNodeKind.EndOfFileToken;
      default:
        return SyntaxNodeKind.BadToken;
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

  static isTrivia(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxTriviaKind.LineBreakTrivia:
      case SyntaxTriviaKind.SpaceTrivia:
      case SyntaxTriviaKind.CommentTrivia:
        return true;
      default:
        return false;
    }
  }
}
