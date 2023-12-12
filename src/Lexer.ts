import { SyntaxKind } from "./CodeAnalysis/Syntax/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/Syntax/SyntaxToken";
import { SyntaxFacts } from "./CodeAnalysis/Syntax/SyntaxFacts";
import { SourceText } from "./CodeAnalysis/SourceText/SourceText";
import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";

export class Lexer {
  private Index = 0;
  private Diagnostics = new DiagnosticBag();
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

  private get Current() {
    return this.Peek(0);
  }

  private get Text() {
    return this.Source.Text.substring(this.Start, this.Index);
  }

  private Next() {
    const Char = this.Current;
    this.Index++;
    return Char;
  }

  private MatchKind(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== SyntaxFacts.Kind(this.Peek(Offset))) return false;
      Offset++;
    }
    return true;
  }

  Lex(): SyntaxToken {
    this.Start = this.Index;

    if (this.IsLetter(this.Current)) {
      while (this.IsLetter(this.Current)) {
        this.Next();
      }
      const Text = this.Text;
      const Kind = SyntaxFacts.KeywordTokenKind(Text);
      return new SyntaxToken(Kind, Text);
    }

    if (this.IsDigit(this.Current)) {
      return this.ParseNumberToken();
    }

    if (this.IsSpace(this.Current)) {
      return this.ParseSpaceToken();
    }

    if (this.MatchKind(SyntaxKind.HashToken)) {
      return this.ParseCommentToken();
    }

    if (this.MatchKind(SyntaxKind.BadToken)) {
      throw this.Diagnostics.BadTokenFound(this.Current);
    }

    const Kind = SyntaxFacts.Kind(this.Current);
    return new SyntaxToken(Kind, this.Next());
  }

  private ParseCommentToken() {
    while (!this.MatchKind(SyntaxKind.NewLineToken) && !this.MatchKind(SyntaxKind.EndOfFileToken)) {
      this.Next();
    }
    return new SyntaxToken(SyntaxKind.CommentToken, this.Text);
  }

  private ParseSpaceToken() {
    while (this.IsSpace(this.Current)) {
      this.Next();
    }
    return new SyntaxToken(SyntaxKind.SpaceToken, this.Text);
  }

  private ParseNumberToken() {
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
    return new SyntaxToken(SyntaxKind.NumberToken, this.Text);
  }
}
