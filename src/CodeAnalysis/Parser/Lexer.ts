import { SyntaxKind } from "./Kind/SyntaxKind";
import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { BinaryOperatorKind } from "./Kind/BinaryOperatorKind";
import { SyntaxToken, TokenTextMapper } from "./SyntaxToken";
import { SyntaxFacts } from "./SyntaxFacts";
import { Submission } from "../../Input/Submission";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { CompositeTokenKind } from "./Kind/CompositeTokenKind";
import { SyntaxTriviaKind } from "./Kind/SyntaxTriviaKind";

export class Lexer {
  private End = 0;
  private Start = this.End;
  private Kind = SyntaxNodeKind.EndOfFileToken as SyntaxKind;

  constructor(public readonly Input: Submission, private Diagnostics: DiagnosticBag) {}

  public Lex(): SyntaxToken<SyntaxKind> {
    this.Start = this.End;
    this.Kind = SyntaxFacts.Kind(this.Char) as keyof TokenTextMapper;
    switch (this.Kind) {
      case SyntaxNodeKind.BadToken:
        if (this.IsLetter(this.Char)) {
          return this.ParseIdentifier();
        }
        if (this.IsDigit(this.Char)) {
          return this.ParseNumberToken();
        }
        if (this.IsSpace(this.Char)) {
          return this.ParseSpaceToken();
        }
        this.Diagnostics.BadTokenFound(this.Char);
        break;
      case SyntaxNodeKind.HashToken:
        return this.ParseCommentToken();
      case BinaryOperatorKind.MinusToken:
        if (this.Match(BinaryOperatorKind.MinusToken, SyntaxNodeKind.GreaterToken)) {
          this.End += 1;
          this.Kind = CompositeTokenKind.PointerToken;
        }
        break;
      case SyntaxNodeKind.GreaterToken:
        if (this.Match(SyntaxNodeKind.GreaterToken, SyntaxNodeKind.GreaterToken)) {
          this.End += 1;
          this.Kind = CompositeTokenKind.GreaterGreaterToken;
        }
    }
    this.End += 1;
    return new SyntaxToken(this.Kind, this.Text, this.Input.SetTextSpan(this.Start, this.End));
  }

  private ParseIdentifier() {
    while (this.IsLetter(this.Char)) {
      this.End += 1;
    }
    return new SyntaxToken(SyntaxFacts.KeywordOrIdentiferTokenKind(this.Text), this.Text, this.Input.SetTextSpan(this.Start, this.End));
  }

  private ParseCommentToken() {
    while (true) {
      this.End += 1;
      if (this.Match(SyntaxTriviaKind.LineBreakTrivia)) break;
      if (this.Match(SyntaxNodeKind.EndOfFileToken)) break;
    }
    return new SyntaxToken(SyntaxTriviaKind.CommentTrivia, this.Text, this.Input.SetTextSpan(this.Start, this.End));
  }

  private ParseSpaceToken() {
    while (this.IsSpace(this.Char)) {
      this.End += 1;
    }
    return new SyntaxToken(SyntaxTriviaKind.SpaceTrivia, this.Text, this.Input.SetTextSpan(this.Start, this.End));
  }

  private ParseNumberToken() {
    while (this.IsDigit(this.Char)) {
      this.End += 1;
    }
    if (this.Match(SyntaxNodeKind.DotToken)) {
      this.End += 1;
      if (!this.IsDigit(this.Char)) {
        this.Diagnostics.BadFloatingPointNumber();
      }
    }
    while (this.IsDigit(this.Char)) {
      this.End += 1;
    }
    const NumberText = this.Text as TokenTextMapper[SyntaxNodeKind.NumberToken];
    return new SyntaxToken(SyntaxNodeKind.NumberToken, NumberText, this.Input.SetTextSpan(this.Start, this.End));
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
    return this.Input.Text.charAt(this.End + Offset);
  }

  private get Char() {
    return this.Peek(0);
  }

  private get Text() {
    return this.Input.Text.substring(this.Start, this.End);
  }

  private Match(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== SyntaxFacts.Kind(this.Peek(Offset))) return false;
      Offset++;
    }
    return true;
  }
}
