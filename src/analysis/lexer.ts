import { SyntaxKind } from "./parser/kind/syntax.kind";
import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { BinaryOperatorKind } from "./parser/kind/binary.operator.kind";
import { SyntaxToken, TokenText, TokenTextMapper } from "./parser/syntax.token";
import { SyntaxFacts } from "./parser/syntax.facts";
import { CompositeTokenKind } from "./parser/kind/composite.token.kind";
import { SyntaxTriviaKind } from "./parser/kind/syntax.trivia.kind";
import { SourceText } from "./input/source.text";
import { DiagnosticBag } from "./diagnostics/diagnostic.bag";
import { Span } from "./input/token.span";

export class Lexer {
  private kind: SyntaxKind;
  private end: number;
  private start: number;

  constructor(public readonly input: SourceText, private diagnostics: DiagnosticBag) {
    this.kind = SyntaxNodeKind.EndOfFileToken;
    this.end = 0;
    this.start = this.end;
  }

  public Lex(): SyntaxToken<SyntaxKind> {
    this.start = this.end;
    this.kind = SyntaxFacts.SyntaxKind(this.Char()) as keyof TokenTextMapper;
    switch (this.kind) {
      case SyntaxNodeKind.BadToken:
        return this.LexBadToken();
      case SyntaxNodeKind.HashToken:
        return this.LexCommentToken();
      case BinaryOperatorKind.MinusToken:
        return this.LexMinusToken();
      case SyntaxNodeKind.GreaterToken:
        return this.LexGreaterGreaterToken();
      case SyntaxNodeKind.ColonToken:
        return this.LexColonColonToken();
    }
    this.Next();
    return new SyntaxToken(this.kind, this.Text(), this.SetTokenSpan());
  }

  private LexBadToken(): SyntaxToken<SyntaxKind> {
    if (this.IsLetter()) {
      return this.LexIdentifier();
    }
    if (this.IsDigit()) {
      return this.LexNumberToken();
    }
    if (this.IsSpace()) {
      return this.LexSpaceToken();
    }
    this.diagnostics.BadTokenFound(this.Char());
    this.Next();
    return new SyntaxToken(this.kind, this.Text(), this.SetTokenSpan());
  }

  private LexCommentToken(): SyntaxToken<SyntaxKind> {
    do {
      this.Next();
    } while (!(this.Match(SyntaxTriviaKind.LineBreakTrivia) || this.Match(SyntaxNodeKind.EndOfFileToken)));
    return new SyntaxToken(SyntaxTriviaKind.CommentTrivia, this.Text(), this.SetTokenSpan());
  }

  private LexMinusToken(): SyntaxToken<SyntaxKind> {
    this.Next();
    this.kind = BinaryOperatorKind.MinusToken;
    if (this.Match(SyntaxNodeKind.GreaterToken)) {
      this.Next();
      this.kind = CompositeTokenKind.PointerToken;
    }
    return new SyntaxToken(this.kind, this.Text() as TokenText<typeof this.kind>, this.SetTokenSpan());
  }

  private LexGreaterGreaterToken(): SyntaxToken<SyntaxKind> {
    this.Next();
    this.kind = SyntaxNodeKind.GreaterToken;
    if (this.Match(SyntaxNodeKind.GreaterToken)) {
      this.Next();
      this.kind = CompositeTokenKind.GreaterGreaterToken;
    }
    return new SyntaxToken(this.kind, this.Text() as TokenText<typeof this.kind>, this.SetTokenSpan());
  }

  private LexColonColonToken(): SyntaxToken<SyntaxKind> {
    this.Next();
    this.kind = SyntaxNodeKind.ColonToken;
    if (this.Match(SyntaxNodeKind.ColonToken)) {
      this.Next();
      this.kind = CompositeTokenKind.ColonColonToken;
    }
    return new SyntaxToken(this.kind, this.Text() as TokenText<typeof this.kind>, this.SetTokenSpan());
  }

  private LexIdentifier(): SyntaxToken<SyntaxKind> {
    while (this.IsLetter()) this.Next();
    const text = this.Text();
    return new SyntaxToken(SyntaxFacts.KeywordOrIdentifer(text), text, this.SetTokenSpan());
  }

  private LexSpaceToken(): SyntaxToken<SyntaxKind> {
    while (this.IsSpace()) this.Next();
    return new SyntaxToken(SyntaxTriviaKind.SpaceTrivia, this.Text(), this.SetTokenSpan());
  }

  private LexNumberToken(): SyntaxToken<SyntaxKind> {
    while (this.IsDigit()) this.Next();
    if (this.Match(SyntaxNodeKind.DotToken)) {
      this.Next();
      if (!this.IsDigit()) {
        this.diagnostics.BadFloatingPointNumber();
      }
    }
    while (this.IsDigit()) this.Next();
    const numberText = this.Text() as TokenText<SyntaxNodeKind.NumberToken>;
    return new SyntaxToken(SyntaxNodeKind.NumberToken, numberText, this.SetTokenSpan());
  }

  private Text() {
    return this.input.text.substring(this.start, this.end);
  }

  private SetTokenSpan(): Span {
    return this.input.SetTokenSpan(this.start, this.end);
  }

  private IsSpace(): boolean {
    const char = this.Char();
    return char === " " || char === "\t" || char === "\r";
  }

  private IsDigit(): boolean {
    const charCode = this.Char().charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
  }

  private IsLetter(): boolean {
    const charCode = this.Char().charCodeAt(0);
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
  }

  private Peek(offset: number): string {
    return this.input.text.charAt(this.end + offset);
  }

  private Char() {
    return this.Peek(0);
  }

  private Next() {
    this.end = this.end + 1;
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
