import { DiagnosticBag } from "../diagnostics/diagnostic.bag";
import { Span } from "./token.span";
import { LineSpan } from "./line.span";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { SyntaxToken } from "../parser/syntax.token";
import { Lexer } from "../lexer";
import { SyntaxNodeKind } from "../parser/kind/syntax.node.kind";

export class SourceText {
  public Tokens = Array<SyntaxToken<SyntaxKind>>();
  private LineSpans = new Array<LineSpan>();

  constructor(public Text: string, public Diagnostics: DiagnosticBag) {
    this.Lex();
  }

  static From(Text: string, Diagnostics: DiagnosticBag): SourceText {
    return new SourceText(Text, Diagnostics);
  }

  Lex(): SourceText {
    const Tokenizer = new Lexer(this, this.Diagnostics);
    var Token: SyntaxToken<SyntaxKind>;
    do {
      Token = Tokenizer.Lex();
      this.Tokens.push(Token);
    } while (Token.Kind !== SyntaxNodeKind.EndOfFileToken);
    return this;
  }

  SetTokenSpan(Start: number, End: number): Span {
    return new Span(this, Start, End);
  }

  GetLineSpan(Index: number): LineSpan {
    let Left = 0;
    let Right = this.LineSpans.length - 1;
    var Position: number;
    while (true) {
      Position = Left + Math.floor((Right - Left) / 2);
      const LineSpan = this.LineSpans[Position];
      if (Index >= LineSpan.Start && Index < LineSpan.End) {
        return LineSpan;
      }
      if (Index < LineSpan.Start) Right = Position - 1;
      else Left = Position + 1;
    }
  }

  GetToken(Index: number): SyntaxToken<SyntaxKind> {
    var Left = 0;
    var Right = this.Tokens.length - 1;
    var Position: number;
    if (!(Index < this.Text.length)) return this.Tokens[this.Tokens.length - 1];
    if (Index < 0) return this.Tokens[0];
    while (true) {
      Position = Left + Math.floor((Right - Left) / 2);
      const Token = this.Tokens[Position];
      const Span = Token.Span;
      if (Index >= Span.Start && Index < Span.End) {
        return Token;
      }
      if (Index < Span.Start) Right = Position - 1;
      else Left = Position + 1;
    }
  }
}
