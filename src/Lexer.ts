import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

export class Lexer {
  constructor(public readonly Input: string) {}

  private Pointer = 0;

  public IsSpace(Char: string): boolean {
    return Char === " " || Char === "\t" || Char === "\n" || Char === "\r";
  }

  private IsDigit(Char: string): boolean {
    const CharCode = Char.charCodeAt(0);
    return CharCode >= 48 && CharCode <= 57;
  }

  private IsLetter(Char: string): boolean {
    const CharCode = Char.charCodeAt(0);
    return (CharCode >= 65 && CharCode <= 90) || (CharCode >= 97 && CharCode <= 122);
  }

  public Peek(Offset: number = 0): string {
    return this.Input.charAt(this.Pointer + Offset);
  }

  private Next(): void {
    this.Pointer++;
  }

  public Lex(): SyntaxToken {
    const Start = this.Pointer;
    const Char = this.Peek();

    if (this.IsLetter(Char)) {
      while (this.IsLetter(this.Peek())) {
        this.Next();
      }
      const Text = this.Input.substring(Start, this.Pointer);
      return new SyntaxToken(SyntaxFacts.KeywordTokenKind(Text), Text);
    }

    if (this.IsDigit(Char)) {
      while (this.IsDigit(this.Peek())) {
        this.Next();
      }
      return new SyntaxToken(SyntaxKind.NumberToken, this.Input.substring(Start, this.Pointer));
    }

    if (this.IsSpace(Char)) {
      while (this.IsSpace(this.Peek())) {
        this.Next();
      }
      return new SyntaxToken(SyntaxKind.SpaceToken, this.Input.substring(Start, this.Pointer));
    }

    const Kind = SyntaxFacts.Kind(Char);

    if (Kind === SyntaxKind.MinusToken && SyntaxFacts.Kind(this.Peek(1)) === SyntaxKind.GreaterToken) {
      this.Next();
      this.Next();
      return new SyntaxToken(SyntaxKind.PointerToken, this.Input.substring(Start, this.Pointer));
    }

    this.Next();
    return new SyntaxToken(Kind, Char);
  }
}
