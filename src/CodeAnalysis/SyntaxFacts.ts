import { SyntaxKind } from "./SyntaxKind";

export class SyntaxFacts {
  constructor() {}

  public static OperatorPrecedence(kind: SyntaxKind) {
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
        return SyntaxKind.Greater;
      case "":
        return SyntaxKind.EOFToken;
      default:
        return SyntaxKind.BadToken;
    }
  }
}
