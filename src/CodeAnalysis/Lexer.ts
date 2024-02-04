import { SyntaxKind } from "./Parsing/Kind/SyntaxKind";
import { SyntaxNodeKind } from "./Parsing/Kind/SyntaxNodeKind";
import { BinaryOperatorKind } from "./Parsing/Kind/BinaryOperatorKind";
import { SyntaxToken, TokenText, TokenTextMapper } from "./Parsing/SyntaxToken";
import { SyntaxFacts } from "./Parsing/SyntaxFacts";
import { Submission } from "../Input/Submission";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { CompositeTokenKind } from "./Parsing/Kind/CompositeTokenKind";
import { SyntaxTriviaKind } from "./Parsing/Kind/SyntaxTriviaKind";
import { TokenSpan } from "../Input/TokenSpan";

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
    this.Next();
    return new SyntaxToken(this.Kind, this.Text, this.SetTextSpan());
  }

  private LexBadToken(): SyntaxToken<SyntaxKind> {
    if (this.IsLetter) {
      return this.LexIdentifier();
    }
    if (this.IsDigit) {
      return this.LexNumberToken();
    }
    if (this.IsSpace) {
      return this.LexSpaceToken();
    }
    this.Diagnostics.BadTokenFound(this.Char);
    this.Next();
    return new SyntaxToken(this.Kind, this.Text, this.SetTextSpan());
  }

  private LexCommentToken(): SyntaxToken<SyntaxKind> {
    do {
      this.Next();
    } while (!(this.Match(SyntaxTriviaKind.LineBreakTrivia) || this.Match(SyntaxNodeKind.EndOfFileToken)));
    return new SyntaxToken(SyntaxTriviaKind.CommentTrivia, this.Text, this.SetTextSpan());
  }

  private LexMinusToken(): SyntaxToken<SyntaxKind> {
    this.Next();
    this.Kind = BinaryOperatorKind.MinusToken;
    if (this.Match(SyntaxNodeKind.GreaterToken)) {
      this.Next();
      this.Kind = CompositeTokenKind.PointerToken;
    }
    return new SyntaxToken(this.Kind, this.Text as TokenText<typeof this.Kind>, this.SetTextSpan());
  }

  private LexGreaterGreaterToken(): SyntaxToken<SyntaxKind> {
    this.Next();
    this.Kind = SyntaxNodeKind.GreaterToken;
    if (this.Match(SyntaxNodeKind.GreaterToken)) {
      this.Next();
      this.Kind = CompositeTokenKind.GreaterGreaterToken;
    }
    return new SyntaxToken(this.Kind, this.Text as TokenText<typeof this.Kind>, this.SetTextSpan());
  }

  private LexIdentifier(): SyntaxToken<SyntaxKind> {
    while (this.IsLetter) this.Next();
    return new SyntaxToken(SyntaxFacts.KeywordOrIdentifer(this.Text), this.Text, this.SetTextSpan());
  }

  private LexSpaceToken(): SyntaxToken<SyntaxKind> {
    while (this.IsSpace) this.Next();
    return new SyntaxToken(SyntaxTriviaKind.SpaceTrivia, this.Text, this.SetTextSpan());
  }

  private LexNumberToken(): SyntaxToken<SyntaxKind> {
    while (this.IsDigit) this.Next();
    if (this.Match(SyntaxNodeKind.DotToken)) {
      this.Next();
      if (!this.IsDigit) {
        this.Diagnostics.BadFloatingPointNumber();
      }
    }
    while (this.IsDigit) this.Next();
    const NumberText = this.Text as TokenText<SyntaxNodeKind.NumberToken>;
    return new SyntaxToken(SyntaxNodeKind.NumberToken, NumberText, this.SetTextSpan());
  }

  private get Text() {
    return this.Input.Text.substring(this.Start, this.End);
  }

  private SetTextSpan(): TokenSpan {
    return this.Input.SetTextSpan(this.Start, this.End);
  }

  private get IsSpace(): boolean {
    const Char = this.Char;
    return Char === " " || Char === "\t" || Char === "\r";
  }

  private get IsDigit(): boolean {
    const charCode = this.Char.charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
  }

  private get IsLetter(): boolean {
    const CharCode = this.Char.charCodeAt(0);
    return (CharCode >= 65 && CharCode <= 90) || (CharCode >= 97 && CharCode <= 122);
  }

  private Peek(Offset: number): string {
    return this.Input.Text.charAt(this.End + Offset);
  }

  private get Char() {
    return this.Peek(0);
  }

  private Next() {
    this.End = this.End + 1;
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
