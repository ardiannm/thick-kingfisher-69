import { DiagnosticBag } from "../diagnostics/diagnostic.bag";
import { TokenSpan } from "./token.span";
import { LineSpan } from "./line.span";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { SyntaxToken } from "../parser/syntax.token";
import { Lexer } from "../lexer";
import { SyntaxTriviaKind } from "../parser/kind/syntax.trivia.kind";
import { SyntaxNodeKind } from "../parser/kind/syntax.node.kind";

export class Submission {
  Tokens = Array<SyntaxToken<SyntaxKind>>();
  Lines = Array<Array<SyntaxToken<SyntaxKind>>>();

  private LineSpans = new Array<LineSpan>();

  constructor(public Text: string, public Diagnostics: DiagnosticBag) {
    this.Lex(this.Diagnostics).SetTokenLines();
    let LineNumber = 1;
    for (const Line of this.Lines) {
      const Span = new LineSpan(LineNumber, Line[0].Span.Start, Line[Line.length - 1].Span.End);
      this.LineSpans.push(Span);
      LineNumber += 1;
    }
  }

  static From(Text: string, Diagnostics: DiagnosticBag): Submission {
    return new Submission(Text, Diagnostics);
  }

  Lex(Diagnostics: DiagnosticBag): Submission {
    const Tokenizer = new Lexer(this, Diagnostics);
    var Token: SyntaxToken<SyntaxKind>;
    do {
      Token = Tokenizer.Lex();
      this.Tokens.push(Token);
    } while (Token.Kind !== SyntaxNodeKind.EndOfFileToken);
    return this;
  }

  SetTokenLines() {
    this.Lines.push(new Array<SyntaxToken<SyntaxKind>>());
    for (const Token of this.Tokens) {
      this.Lines[this.Lines.length - 1].push(Token);
      if (Token.Kind === SyntaxTriviaKind.LineBreakTrivia) this.Lines.push(new Array<SyntaxToken<SyntaxKind>>());
    }
  }

  SetTokenSpan(Start: number, End: number): TokenSpan {
    return new TokenSpan(this, Start, End);
  }

  GetLineSpan(Position: number): LineSpan {
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
