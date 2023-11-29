import { SyntaxKind } from "./SyntaxKind";

export class SyntaxFacts {
  public static UnaryOperatorPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return 3;
      default:
        return 0;
    }
  }

  public static BinaryOperatorPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxKind.StarToken:
      case SyntaxKind.SlashToken:
        return 2;
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return 1;
      default:
        return 0;
    }
  }

  public static Kind(text: string): SyntaxKind {
    switch (text) {
      case "+":
        return SyntaxKind.PlusToken;
      case "-":
        return SyntaxKind.MinusToken;
      case "*":
        return SyntaxKind.StarToken;
      case "/":
        return SyntaxKind.SlashToken;
      case ":":
        return SyntaxKind.ColonToken;
      case "(":
        return SyntaxKind.OpenParenToken;
      case ")":
        return SyntaxKind.CloseParenToken;
      case ">":
        return SyntaxKind.GreaterToken;
      case "{":
        return SyntaxKind.OpenBraceToken;
      case "}":
        return SyntaxKind.CloseBraceToken;
      case ",":
        return SyntaxKind.Comma;
      case "":
        return SyntaxKind.EndOfFileToken;
      default:
        return SyntaxKind.BadToken;
    }
  }

  public static KeywordTokenKind(text: string): SyntaxKind {
    switch (text) {
      case "True":
        return SyntaxKind.TrueToken;
      case "False":
        return SyntaxKind.FalseToken;
      default:
        return SyntaxKind.IdentifierToken;
    }
  }
}
