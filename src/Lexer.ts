import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

export class Lexer {
  constructor(public readonly Input: string) {}

  private Index = 0;

  public IsSpace(char: string): boolean {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
  }

  private IsDigit(char: string): boolean {
    const CharCode = char.charCodeAt(0);
    return CharCode >= 48 && CharCode <= 57;
  }

  private IsLetter(char: string): boolean {
    const CharCode = char.charCodeAt(0);
    return (CharCode >= 65 && CharCode <= 90) || (CharCode >= 97 && CharCode <= 122);
  }

  public GetChar(): string {
    return this.Input.charAt(this.Index);
  }

  private Advance(): void {
    this.Index = this.Index + 1;
  }

  public Lex(): SyntaxToken {
    const Start = this.Index;

    const Char = this.GetChar();

    if (this.IsLetter(Char)) {
      while (this.IsLetter(this.GetChar())) {
        this.Advance();
      }
      const Text = this.Input.substring(Start, this.Index);
      return new SyntaxToken(SyntaxKind.IdentifierToken, Text, Start);
    }

    if (this.IsDigit(Char)) {
      while (this.IsDigit(this.GetChar())) {
        this.Advance();
      }
      const Text = this.Input.substring(Start, this.Index);
      return new SyntaxToken(SyntaxKind.NumberToken, Text, Start);
    }

    if (this.IsSpace(Char)) {
      while (this.IsSpace(this.GetChar())) {
        this.Advance();
      }
      const Text = this.Input.substring(Start, this.Index);
      return new SyntaxToken(SyntaxKind.SpaceToken, Text, Start);
    }

    this.Advance();

    const Kind = SyntaxFacts.Kind(Char);
    return new SyntaxToken(Kind, Char, Start);
  }
}
