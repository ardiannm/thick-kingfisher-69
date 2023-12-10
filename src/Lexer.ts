import { SyntaxKind } from "./CodeAnalysis/Syntax/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/Syntax/SyntaxToken";
import { SyntaxFacts } from "./CodeAnalysis/Syntax/SyntaxFacts";
import { SourceText } from "./CodeAnalysis/SourceText/SourceText";
import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";

// Lexer class responsible for converting source text into tokens.

export class Lexer {
  // Index to keep track of the current position in the source text.
  private Index = 0;
  private Diagnostics = new DiagnosticBag();

  // Constructor that takes a SourceText object.
  constructor(public readonly Source: SourceText) {}

  // Checks if a character is a space character.
  private IsSpace(Char: string): boolean {
    return Char === " " || Char === "\n" || Char === "\t" || Char === "\r";
  }

  // Checks if a character is a digit.
  private IsDigit(Char: string): boolean {
    const CharCode = Char.charCodeAt(0);
    return CharCode >= 48 && CharCode <= 57;
  }

  // Checks if a character is a letter.
  private IsLetter(Char: string): boolean {
    const CharCode = Char.charCodeAt(0);
    return (CharCode >= 65 && CharCode <= 90) || (CharCode >= 97 && CharCode <= 122);
  }

  // Peeks at the character at a specified offset.
  private Peek(Offset: number): string {
    return this.Source.Text.charAt(this.Index + Offset);
  }

  // Gets the current character.
  private get Current() {
    return this.Peek(0);
  }

  // Advances to the next character.
  private Next() {
    const Char = this.Current;
    this.Index++;
    return Char;
  }

  // Matches the current token's kind with the provided kinds.
  private MatchKind(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== SyntaxFacts.Kind(this.Peek(Offset))) return false;
      Offset++;
    }
    return true;
  }

  // Lex method tokenizes the source text and returns a SyntaxToken.
  Lex(): SyntaxToken {
    const Start = this.Index;

    // If the current character is a letter, tokenize as a keyword.
    if (this.IsLetter(this.Current)) {
      while (this.IsLetter(this.Current)) {
        this.Next();
      }
      const Text = this.Source.Text.substring(Start, this.Index);
      return new SyntaxToken(SyntaxFacts.KeywordTokenKind(Text), Text);
    }

    // If the current character is a digit, tokenize as a number.
    if (this.IsDigit(this.Current)) {
      while (this.IsDigit(this.Current)) {
        this.Next();
      }
      if (this.MatchKind(SyntaxKind.DotToken)) {
        this.Next();
        if (!this.IsDigit(this.Current)) {
          throw this.Diagnostics.WrongFloatingNumberFormat();
        }
      }
      while (this.IsDigit(this.Current)) {
        this.Next();
      }
      return new SyntaxToken(SyntaxKind.NumberToken, this.Source.Text.substring(Start, this.Index));
    }

    // If the current character is a space, tokenize as a space token.
    if (this.IsSpace(this.Current)) {
      while (this.IsSpace(this.Current)) {
        this.Next();
      }
      return new SyntaxToken(SyntaxKind.SpaceToken, this.Source.Text.substring(Start, this.Index));
    }

    if (this.MatchKind(SyntaxKind.BadToken)) {
      throw this.Diagnostics.BadTokenFound(this.Current);
    }

    // Otherwise, treat the token as a single character.
    const Kind = SyntaxFacts.Kind(this.Current);
    return new SyntaxToken(Kind, this.Next());
  }
}
