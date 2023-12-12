import { SyntaxKind } from "./CodeAnalysis/Syntax/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/Syntax/SyntaxToken";
import { SyntaxFacts } from "./CodeAnalysis/Syntax/SyntaxFacts";
import { SourceText } from "./CodeAnalysis/SourceText/SourceText";
import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";

export class Lexer {
  private Index = 0;
  private Diagnostics = new DiagnosticBag();

  constructor(public readonly Source: SourceText) {}

  private IsSpace(Char: string): boolean {
    return Char === " " || Char === "\n" || Char === "\t" || Char === "\r";
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
    const Start = this.Index;

    if (this.IsLetter(this.Current)) {
      while (this.IsLetter(this.Current)) {
        this.Next();
      }
      const Text = this.Source.Text.substring(Start, this.Index);
      return new SyntaxToken(SyntaxFacts.KeywordTokenKind(Text), Text);
    }

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

    if (this.IsSpace(this.Current)) {
      while (this.IsSpace(this.Current)) {
        this.Next();
      }
      return new SyntaxToken(SyntaxKind.SpaceToken, this.Source.Text.substring(Start, this.Index));
    }

    if (this.MatchKind(SyntaxKind.BadToken)) {
      throw this.Diagnostics.BadTokenFound(this.Current);
    }

    const Kind = SyntaxFacts.Kind(this.Current);
    return new SyntaxToken(Kind, this.Next());
  }
}
