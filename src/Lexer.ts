import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

// Lexer Class For Tokenizing Input Strings
export class Lexer {
  constructor(public readonly Input: string) {}

  private Pointer = 0;

  // Check If The Character Is A Whitespace Character
  public IsSpace(Char: string): boolean {
    return Char === " " || Char === "\t" || Char === "\n" || Char === "\r";
  }

  // Check If The Character Is A Digit
  private IsDigit(Char: string): boolean {
    const CharCode = Char.charCodeAt(0);
    return CharCode >= 48 && CharCode <= 57;
  }

  // Check If The Character Is A Letter
  private IsLetter(Char: string): boolean {
    const CharCode = Char.charCodeAt(0);
    return (CharCode >= 65 && CharCode <= 90) || (CharCode >= 97 && CharCode <= 122);
  }

  // Peek At The Character At The Specified Offset From The Current Position
  public Peek(Offset: number = 0): string {
    return this.Input.charAt(this.Pointer + Offset);
  }

  // Move The Pointer To The Next Character In The Input String
  private Next(): void {
    this.Pointer++;
  }

  // Helper Method To Check If The Next Token Matches The Given Kinds
  private MatchKind(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== SyntaxFacts.Kind(this.Peek(Offset))) return false;
      Offset++;
    }
    Kinds.forEach(() => this.Next());
    return true;
  }

  // Lexical Analysis To Generate Tokens
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

    // Check If Token Is A Composite Token
    if (this.MatchKind(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      return new SyntaxToken(SyntaxKind.PointerToken, this.Input.substring(Start, this.Pointer));
    }

    const Kind = SyntaxFacts.Kind(Char);

    this.Next();
    return new SyntaxToken(Kind, Char);
  }
}
