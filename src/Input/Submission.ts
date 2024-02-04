import { SyntaxKind } from "../CodeAnalysis/Parsing/Kind/SyntaxKind";
import { SyntaxNodeKind } from "../CodeAnalysis/Parsing/Kind/SyntaxNodeKind";
import { Lexer } from "../CodeAnalysis/Lexer";
import { SyntaxToken } from "../CodeAnalysis/Parsing/SyntaxToken";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { LineSpan } from "./LineSpan";
import { TokenSpan } from "./TokenSpan";

export class Submission {
  private Index = 0;
  private LineSpans = new Array<LineSpan>();

  Tokens = Array<SyntaxToken<SyntaxKind>>();

  constructor(public Text: string) {
    this.SetLineSpans();
  }

  static From(Text: string) {
    return new Submission(Text);
  }

  Lex(Diagnostics: DiagnosticBag) {
    const Tokenizer = new Lexer(this, Diagnostics);
    var Token: SyntaxToken<SyntaxKind>;
    do {
      Token = Tokenizer.Lex();
      this.Tokens.push(Token);
    } while (Token.Kind !== SyntaxNodeKind.EndOfFileToken);
    return this.Tokens;
  }

  SetTextSpan(Start: number, End: number) {
    return new TokenSpan(this, Start, End);
  }

  private SetLineSpans() {
    let Start = this.Index;
    while (this.Index <= this.Text.length) {
      const Char = this.Text.charAt(this.Index);
      if (Char === "\n") {
        const Span = new LineSpan(Start, this.Index);
        this.LineSpans.push(Span);
        Start = this.Index;
      }
      this.Index++;
    }
    const Span = new LineSpan(Start, this.Index);
    this.LineSpans.push(Span);
    return this.LineSpans;
  }

  GetLineIndex(TextSpan: TokenSpan) {
    let Left = 0;
    let Right = this.LineSpans.length - 1;
    var Index: number;
    while (true) {
      Index = Left + Math.floor((Right - Left) / 2);
      const LineSpan = this.LineSpans[Index];
      if (TextSpan.Start >= LineSpan.Start && TextSpan.Start < LineSpan.End) {
        return Index + 1;
      }
      if (TextSpan.Start < LineSpan.Start) Right = Index - 1;
      else Left = Index + 1;
    }
  }

  GetLineSpanAtIndex(Index: number) {
    return this.LineSpans[Index - 1];
  }

  GetTokenSpanAtIndex(Position: number) {
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
