import { SyntaxKind } from "../CodeAnalysis/Parsing/Kind/SyntaxKind";
import { SyntaxNodeKind } from "../CodeAnalysis/Parsing/Kind/SyntaxNodeKind";
import { Lexer } from "../CodeAnalysis/Lexer";
import { SyntaxToken } from "../CodeAnalysis/Parsing/SyntaxToken";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { LineSpan } from "./LineSpan";
import { TokenSpan } from "./TokenSpan";

export class Submission {
  private Start = 0;
  private End = 0;
  private Line = 0;
  private LineSpans = new Array<LineSpan>();

  Tokens = Array<SyntaxToken<SyntaxKind>>();

  constructor(public Text: string) {
    this.SetLines();
  }

  static From(Text: string): Submission {
    return new Submission(Text);
  }

  Lex(Diagnostics: DiagnosticBag): Array<SyntaxToken<SyntaxKind>> {
    const Tokenizer = new Lexer(this, Diagnostics);
    var Token: SyntaxToken<SyntaxKind>;
    do {
      Token = Tokenizer.Lex();
      this.Tokens.push(Token);
    } while (Token.Kind !== SyntaxNodeKind.EndOfFileToken);
    return this.Tokens;
  }

  SetTokenSpan(Start: number, End: number): TokenSpan {
    return new TokenSpan(this, Start, End);
  }

  private SetLines(): Array<LineSpan> {
    this.Start = this.End;
    while (this.End <= this.Text.length) {
      const Char = this.Text.charAt(this.End);
      if (Char === "\n") {
        this.Line += 1;
        const Span = new LineSpan(this.Start, this.End, this.Line);
        this.LineSpans.push(Span);
        this.Start = this.End;
      }
      this.End++;
    }
    const Span = new LineSpan(this.Start, this.End, this.Line);
    this.LineSpans.push(Span);
    return this.LineSpans;
  }

  GetLine(Position: number): LineSpan {
    let Left = 0;
    let Right = this.LineSpans.length - 1;
    var Index: number;
    while (true) {
      Index = Left + Math.floor((Right - Left) / 2);
      const LineSpan = this.LineSpans[Index];
      if (Position >= LineSpan.Start && Position < LineSpan.End) {
        return LineSpan;
      }
      if (Position < LineSpan.Start) Right = Index - 1;
      else Left = Index + 1;
    }
  }

  GetToken(Position: number): SyntaxToken<SyntaxKind> {
    var Left = 0;
    var Right = this.Tokens.length - 1;
    var Index: number;
    if (!(Position < this.Text.length)) return this.Tokens[this.Tokens.length - 1];
    if (Position < 0) return this.Tokens[0];
    while (true) {
      Index = Left + Math.floor((Right - Left) / 2);
      const Token = this.Tokens[Index];
      const Span = Token.Span;
      if (Position >= Span.Start && Position < Span.End) {
        return Token;
      }
      if (Position < Span.Start) Right = Index - 1;
      else Left = Index + 1;
    }
  }
}
