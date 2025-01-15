import { SyntaxKind } from "./syntax.kind"

export class SyntaxFacts {
  static getUnaryPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return 3
      default:
        return 0
    }
  }

  static getBinaryPrecedence(kind: SyntaxKind) {
    switch (kind) {
      case SyntaxKind.HatToken:
        return 3
      case SyntaxKind.StarToken:
      case SyntaxKind.SlashToken:
        return 2
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return 1
      default:
        return 0
    }
  }
}
