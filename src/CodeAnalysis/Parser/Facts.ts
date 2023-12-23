import { SyntaxKind } from "./SyntaxKind";

export class Facts {
  public static UnaryPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return 3;
      default:
        return 0;
    }
  }

  public static BinaryPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxKind.HatToken:
        return 3;
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
      case "^":
        return SyntaxKind.HatToken;
      case ":":
        return SyntaxKind.ColonToken;
      case "(":
        return SyntaxKind.OpenParenthesisToken;
      case ")":
        return SyntaxKind.CloseParenthesisToken;
      case ".":
        return SyntaxKind.DotToken;
      case "#":
        return SyntaxKind.HashToken;
      case ">":
        return SyntaxKind.GreaterToken;
      case "\n":
        return SyntaxKind.NewLineToken;
      case "":
        return SyntaxKind.EndOfFileToken;
      default:
        return SyntaxKind.BadToken;
    }
  }

  public static KeywordOrIdentiferTokenKind(text: string): SyntaxKind {
    switch (text) {
      case "true":
        return SyntaxKind.TrueKeyword;
      case "false":
        return SyntaxKind.FalseKeyword;
      default:
        return SyntaxKind.IdentifierToken;
    }
  }
}
