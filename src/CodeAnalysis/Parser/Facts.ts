import { SyntaxKind } from "./Kind/SyntaxKind";
import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { BinaryOperatorKind } from "./Kind/BinaryOperatorKind";
import { UnaryOperatorKind } from "./Kind/UnaryOperatorKind";
import { SyntaxKeywordKind } from "./Kind/SyntaxKeywordKind";
import { SyntaxTriviaKind } from "./Kind/SyntaxTriviaKind";

export class Facts {
  public static UnaryPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case UnaryOperatorKind.PlusToken:
      case UnaryOperatorKind.MinusToken:
        return 3;
      default:
        return 0;
    }
  }

  public static BinaryPrecedence(kind: SyntaxKind) {
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

  public static Kind(text: string): SyntaxKind {
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
      case ".":
        return SyntaxNodeKind.DotToken;
      case "#":
        return SyntaxNodeKind.HashToken;
      case ">":
        return SyntaxNodeKind.GreaterToken;
      case "\n":
        return SyntaxTriviaKind.LineBreakTrivia;
      case "":
        return SyntaxNodeKind.EndOfFileToken;
      default:
        return SyntaxNodeKind.BadToken;
    }
  }

  public static KeywordOrIdentiferTokenKind(text: string): SyntaxKind {
    switch (text) {
      case "true":
        return SyntaxKeywordKind.TrueKeyword;
      case "false":
        return SyntaxKeywordKind.FalseKeyword;
      default:
        return SyntaxNodeKind.IdentifierToken;
    }
  }

  public static IsTrivia(Kind: SyntaxKind) {
    switch (Kind) {
      case SyntaxTriviaKind.LineBreakTrivia:
      case SyntaxTriviaKind.SpaceTrivia:
      case SyntaxTriviaKind.CommentTrivia:
        return true;
      default:
        return false;
    }
  }
}
