import { SyntaxKind } from "./Kind/SyntaxKind";
import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { BinaryOperatorKind } from "./Kind/BinaryOperatorKind";
import { SyntaxToken, TokenTextMapper } from "./SyntaxToken";
import { Facts } from "./Facts";
import { SourceText } from "../../Text/SourceText";
import { DiagnosticBag } from "../../Diagnostics/DiagnosticBag";
import { CompositeTokenKind } from "./Kind/CompositeTokenKind";
import { SyntaxTriviaKind } from "./Kind/SyntaxTriviaKind";

export class Lexer {
  private End = 0;
  private Start = this.End;
  private Kind = SyntaxNodeKind.EndOfFileToken as SyntaxKind;

  constructor(public readonly Input: SourceText, private Diagnostics: DiagnosticBag) {}

  public Lex(): SyntaxToken<SyntaxKind> {
    this.Start = this.End;
    this.Kind = Facts.Kind(this.Char) as keyof TokenTextMapper;

    switch (this.Kind) {
      case SyntaxNodeKind.BadToken:
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

        // if all else fails then report a bad token error
        this.Diagnostics.BadTokenFound(this.Char);
        break;

      case SyntaxNodeKind.HashToken:
        // special case for hash token when it comes to comments
        return this.ParseCommentToken();

      case BinaryOperatorKind.MinusToken:
        // special case for minus token
        if (this.Match(BinaryOperatorKind.MinusToken, SyntaxNodeKind.GreaterToken)) {
          // increment one more to account for the next token
          this.End += 1;
          this.Kind = CompositeTokenKind.PointerToken;
        }
        break;

      case SyntaxNodeKind.GreaterToken:
        // special case for greater token
        if (this.Match(SyntaxNodeKind.GreaterToken, SyntaxNodeKind.GreaterToken)) {
          // increment one more to account for the next token
          this.End += 1;
          this.Kind = CompositeTokenKind.GreaterGreaterToken;
        }
    }

    // else by default increment index position by one for all cases
    this.End += 1;

    return new SyntaxToken(this.Kind, this.Text, this.Input.CreateTextSpan(this.Start, this.End));
  }

  // parse identifier tokens
  private ParseIdentifier() {
    while (this.IsLetter(this.Char)) {
      this.End += 1;
    }
    return new SyntaxToken(
      Facts.KeywordOrIdentiferTokenKind(this.Text),
      this.Text,
      this.Input.CreateTextSpan(this.Start, this.End)
    );
  }

  // parse comment tokens
  private ParseCommentToken() {
    while (true) {
      this.End += 1;
      if (this.Match(SyntaxTriviaKind.LineBreakTrivia)) break;
      if (this.Match(SyntaxNodeKind.EndOfFileToken)) break;
    }
    return new SyntaxToken(SyntaxTriviaKind.CommentTrivia, this.Text, this.Input.CreateTextSpan(this.Start, this.End));
  }

  // parse space tokens
  private ParseSpaceToken() {
    while (this.IsSpace(this.Char)) {
      this.End += 1;
    }
    return new SyntaxToken(SyntaxTriviaKind.SpaceTrivia, this.Text, this.Input.CreateTextSpan(this.Start, this.End));
  }

  // parse number tokens
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
    return new SyntaxToken(SyntaxNodeKind.NumberToken, NumberText, this.Input.CreateTextSpan(this.Start, this.End));
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
      if (Kind !== Facts.Kind(this.Peek(Offset))) return false;
      Offset++;
    }
    return true;
  }
}
