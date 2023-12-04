import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

// Lexer Class For Tokenizing Input Strings
export class Lexer {
  constructor(public readonly Input: string) {}

  private Index = 0;

  // Check If The Character Is A Whitespace Character
  private IsSpace(Char: string): boolean {
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
  private Peek(Offset: number): string {
    return this.Input.charAt(this.Index + Offset);
  }

  private get Current() {
    return this.Peek(0);
  }

  // Move The Pointer To The Next Character In The Input String
  private Next() {
    const Char = this.Current;
    this.Index++;
    return Char;
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
  Lex(): SyntaxToken {
    const Start = this.Index;

    if (this.IsLetter(this.Current)) {
      while (this.IsLetter(this.Current)) {
        this.Next();
      }
      const Text = this.Input.substring(Start, this.Index);
      return new SyntaxToken(SyntaxFacts.KeywordTokenKind(Text), Text);
    }

    if (this.IsDigit(this.Current)) {
      while (this.IsDigit(this.Current)) {
        this.Next();
      }
      return new SyntaxToken(SyntaxKind.NumberToken, this.Input.substring(Start, this.Index));
    }

    if (this.IsSpace(this.Current)) {
      while (this.IsSpace(this.Current)) {
        this.Next();
      }
      return new SyntaxToken(SyntaxKind.SpaceToken, this.Input.substring(Start, this.Index));
    }

    // Check If Token Is A Composite Token
    if (this.MatchKind(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      return new SyntaxToken(SyntaxKind.PointerToken, this.Input.substring(Start, this.Index));
    }

    const Kind = SyntaxFacts.Kind(this.Current);
    return new SyntaxToken(Kind, this.Next());
  }
}
