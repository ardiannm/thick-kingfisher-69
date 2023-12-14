import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { Facts } from "./Syntax/Facts";
import { SourceText } from "./SourceText/SourceText";
import { DiagnosticBag } from "./Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "./Diagnostics/DiagnosticKind";

export class Lexer {
  private Index = 0;
  private Diagnostics = new DiagnosticBag(DiagnosticKind.Lexer);
  private Start = this.Index;

  constructor(public readonly Source: SourceText) {}

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

  Lex(): SyntaxToken {
    this.Start = this.Index;

    if (this.IsLetter(this.Char)) {
      return this.ParseIdentifier();
    }
    if (this.IsDigit(this.Char)) {
      return this.ParseNumberToken();
    }
    if (this.IsSpace(this.Char)) {
      return this.ParseSpaceToken();
    }
    if (this.Match(SyntaxKind.HashToken)) {
      return this.ParseCommentToken();
    }
    if (this.Match(SyntaxKind.MinusToken, SyntaxKind.GreaterToken)) {
      this.Index += 2;
      return new SyntaxToken(SyntaxKind.PointerToken, this.Text);
    }
    if (this.Match(SyntaxKind.BadToken)) {
      throw this.Diagnostics.BadTokenFound(this.Char);
    }

    this.Index += 1;

    return new SyntaxToken(Facts.Kind(this.Text), this.Text);
  }

  private ParseIdentifier() {
    while (this.IsLetter(this.Char)) this.Index += 1;
    return new SyntaxToken(Facts.KeywordTokenKind(this.Text), this.Text);
  }

  private ParseCommentToken() {
    while (true) {
      this.Index += 1;
      if (this.Match(SyntaxKind.NewLineToken)) break;
      if (this.Match(SyntaxKind.EndOfFileToken)) break;
    }
    return new SyntaxToken(SyntaxKind.CommentToken, this.Text);
  }

  private ParseSpaceToken() {
    while (this.IsSpace(this.Char)) this.Index += 1;
    return new SyntaxToken(SyntaxKind.SpaceToken, this.Text);
  }

  private ParseNumberToken() {
    while (this.IsDigit(this.Char)) this.Index += 1;
    if (this.Match(SyntaxKind.DotToken)) {
      this.Index += 1;
      if (!this.IsDigit(this.Char)) {
        throw this.Diagnostics.WrongFloatingNumberFormat();
      }
    }
    while (this.IsDigit(this.Char)) this.Index += 1;
    return new SyntaxToken(SyntaxKind.NumberToken, this.Text);
  }
}
