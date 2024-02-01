import { SyntaxKind } from "./Kind/SyntaxKind";
import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { BinaryOperatorKind } from "./Kind/BinaryOperatorKind";
import { SyntaxToken, TokenTextMapper } from "./SyntaxToken";
import { SyntaxFacts } from "./SyntaxFacts";
import { Submission } from "../../Input/Submission";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { CompositeTokenKind } from "./Kind/CompositeTokenKind";
import { SyntaxTriviaKind } from "./Kind/SyntaxTriviaKind";
import { TextSpan } from "../../Input/TextSpan";

export class Lexer {
  private Kind: SyntaxKind;
  private End: number;
  private Start: number;

  constructor(public readonly Input: Submission, private Diagnostics: DiagnosticBag) {
    this.Kind = SyntaxNodeKind.EndOfFileToken;
    this.End = 0;
    this.Start = this.End;
  }

  public Lex(): SyntaxToken<SyntaxKind> {
    this.Start = this.End;
    this.Kind = SyntaxFacts.SyntaxKind(this.Char) as keyof TokenTextMapper;
    switch (this.Kind) {
      case SyntaxNodeKind.BadToken:
        return this.LexBadToken();
      case SyntaxNodeKind.HashToken:
        return this.LexCommentToken();
      case BinaryOperatorKind.MinusToken:
        return this.LexMinusToken();
      case SyntaxNodeKind.GreaterToken:
        return this.LexGreaterGreaterToken();
    }
    this.Consume();
    return new SyntaxToken(this.Kind, this.Text, this.SetTextSpan());
  }

  private LexBadToken(): SyntaxToken<SyntaxKind> {
    if (this.IsLetter(this.Char)) {
      return this.LexIdentifier();
    }
    if (this.IsDigit(this.Char)) {
      return this.LexNumberToken();
    }
    if (this.IsSpace(this.Char)) {
      return this.LexSpaceToken();
    }
    this.Diagnostics.BadTokenFound(this.Char);
    this.Consume();
    return new SyntaxToken(this.Kind, this.Text, this.SetTextSpan());
  }

  private LexCommentToken(): SyntaxToken<SyntaxKind> {
    while (true) {
      this.Consume();
      if (this.Match(SyntaxTriviaKind.LineBreakTrivia)) break;
      if (this.Match(SyntaxNodeKind.EndOfFileToken)) break;
    }
    return new SyntaxToken(SyntaxTriviaKind.CommentTrivia, this.Text, this.SetTextSpan());
  }

  private LexMinusToken(): SyntaxToken<SyntaxKind> {
    if (this.Match(BinaryOperatorKind.MinusToken, SyntaxNodeKind.GreaterToken)) {
      this.Consume();
      this.Kind = CompositeTokenKind.PointerToken;
    }
    return new SyntaxToken(this.Kind, this.Text, this.SetTextSpan());
  }

  private LexGreaterGreaterToken(): SyntaxToken<SyntaxKind> {
    if (this.Match(SyntaxNodeKind.GreaterToken, SyntaxNodeKind.GreaterToken)) {
      this.Consume();
      this.Consume();
      this.Kind = CompositeTokenKind.GreaterGreaterToken;
    }
    return new SyntaxToken(this.Kind, this.Text, this.SetTextSpan());
  }

  private LexIdentifier(): SyntaxToken<SyntaxKind> {
    while (this.IsLetter(this.Char)) {
      this.Consume();
    }
    return new SyntaxToken(SyntaxFacts.KeywordOrIdentifer(this.Text), this.Text, this.SetTextSpan());
  }

  private LexSpaceToken(): SyntaxToken<SyntaxKind> {
    while (this.IsSpace(this.Char)) {
      this.Consume();
    }
    return new SyntaxToken(SyntaxTriviaKind.SpaceTrivia, this.Text, this.SetTextSpan());
  }

  private LexNumberToken(): SyntaxToken<SyntaxKind> {
    while (this.IsDigit(this.Char)) {
      this.Consume();
    }
    if (this.Match(SyntaxNodeKind.DotToken)) {
      this.Consume();
      if (!this.IsDigit(this.Char)) {
        this.Diagnostics.BadFloatingPointNumber();
      }
    }
    while (this.IsDigit(this.Char)) {
      this.Consume();
    }
    const NumberText = this.Text as TokenTextMapper[SyntaxNodeKind.NumberToken];
    return new SyntaxToken(SyntaxNodeKind.NumberToken, NumberText, this.SetTextSpan());
  }

  private SetTextSpan(): TextSpan {
    return this.Input.SetTextSpan(this.Start, this.End);
  }

  private IsSpace(Char: string): boolean {
    return Char === " " || Char === "\t" || Char === "\r";
  }

  private IsDigit(Char: string): boolean {
    const charCode = Char.charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
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

  private Consume() {
    this.End = this.End + 1;
  }

  private get Text() {
    return this.Input.Text.substring(this.Start, this.End);
  }

  private Match(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== SyntaxFacts.SyntaxKind(this.Peek(Offset))) return false;
      Offset++;
    }
    return true;
  }
}
