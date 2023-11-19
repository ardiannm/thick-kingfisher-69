import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

export class Lexer {
  constructor(public readonly Input: string) {}

  private Index = 0;

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

  public GetChar(): string {
    return this.Input.charAt(this.Index);
  }

  private Advance(): void {
    this.Index = this.Index + 1;
  }

  public Lex(): SyntaxToken {
    const Start = this.Index;
    const Char = this.GetChar();

    switch (true) {
      case this.IsLetter(Char):
        while (this.IsLetter(this.GetChar())) {
          this.Advance();
        }
        const Text = this.Input.substring(Start, this.Index);
        const NodeKind = SyntaxFacts.KeywordTokenKind(Text);
        return new SyntaxToken(NodeKind, Text);

      case this.IsDigit(Char):
        while (this.IsDigit(this.GetChar())) {
          this.Advance();
        }
        return new SyntaxToken(SyntaxKind.NumberToken, this.Input.substring(Start, this.Index));

      case this.IsSpace(Char):
        while (this.IsSpace(this.GetChar())) {
          this.Advance();
        }
        return new SyntaxToken(SyntaxKind.SpaceToken, this.Input.substring(Start, this.Index));

      default:
        this.Advance();
        const Kind = SyntaxFacts.Kind(Char);
        return new SyntaxToken(Kind, Char);
    }
  }
}
