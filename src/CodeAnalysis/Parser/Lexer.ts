import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { Facts } from "./Facts";
import { SourceText } from "../Text/SourceText";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "../Diagnostics/DiagnosticKind";

export class Lexer {
  private Index = 0;
  private Diagnostics = new DiagnosticBag(DiagnosticKind.Lexer);
  private Start = this.Index;
  private Kind = SyntaxKind.EndOfFileToken;

  constructor(public readonly Source: SourceText) {}

  Lex(): SyntaxToken {
    this.Start = this.Index;
    this.Kind = Facts.Kind(this.Char);

    switch (this.Kind) {
      case SyntaxKind.BadToken:
        // if no token matched from the syntax facts this may still be either a letter, number or space token

        if (this.IsLetter(this.Char)) {
          return this.ParseIdentifier();
        }
        if (this.IsDigit(this.Char)) {
          return this.ParseNumberToken();
        }
        if (this.IsSpace(this.Char)) {
          return this.ParseSpaceToken();
        }

        // if all else fails then throw a bad token error
        throw this.Diagnostics.BadTokenFound(this.Char);

      case SyntaxKind.HashToken:
        // special case for hash token when it comes to comments
        return this.ParseCommentToken();

      case SyntaxKind.MinusToken:
        // special case for minus token
        if (this.Match(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
          // increment one more to account for the next token
          this.Index += 1;
          this.Kind = SyntaxKind.PointerToken;
        }
    }

    // else by default increment index position by one for all cases
    this.Index += 1;

    return new SyntaxToken(this.Kind, this.Text);
  }

  // parse identifier tokens
  private ParseIdentifier() {
    while (this.IsLetter(this.Char)) {
      this.Index += 1;
    }
    return new SyntaxToken(Facts.KeywordTokenKind(this.Text), this.Text);
  }

  // parse comment tokens
  private ParseCommentToken() {
    while (true) {
      this.Index += 1;
      if (this.Match(SyntaxKind.NewLineToken)) break;
      if (this.Match(SyntaxKind.EndOfFileToken)) break;
    }
    return new SyntaxToken(SyntaxKind.CommentToken, this.Text);
  }

  // parse space tokens
  private ParseSpaceToken() {
    while (this.IsSpace(this.Char)) {
      this.Index += 1;
    }
    return new SyntaxToken(SyntaxKind.SpaceToken, this.Text);
  }

  // parse number tokens
  private ParseNumberToken() {
    while (this.IsDigit(this.Char)) {
      this.Index += 1;
    }
    if (this.Match(SyntaxKind.DotToken)) {
      this.Index += 1;
      if (!this.IsDigit(this.Char)) throw this.Diagnostics.WrongFloatingNumberFormat();
    }
    while (this.IsDigit(this.Char)) {
      this.Index += 1;
    }
    return new SyntaxToken(SyntaxKind.NumberToken, this.Text);
  }

  private IsSpace(Char: string): boolean {
    return Char === " " || Char === "\t" || Char === "\r";
  }

  private IsDigit(Char: string): boolean {
    const CharCode = Char.charCodeAt(0);
    return CharCode >= 48 && CharCode <= 57;
  }

  private IsLetter(Char: string): boolean {
    const CharCode = Char.charCodeAt(0);
    return (CharCode >= 65 && CharCode <= 90) || (CharCode >= 97 && CharCode <= 122);
  }

  private Peek(Offset: number): string {
    return this.Source.Text.charAt(this.Index + Offset);
  }

  private get Char() {
    return this.Peek(0);
  }

  private get Text() {
    return this.Source.Text.substring(this.Start, this.Index);
  }

  private Match(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== Facts.Kind(this.Peek(Offset))) return false;
      Offset++;
    }
    return true;
  }
}
