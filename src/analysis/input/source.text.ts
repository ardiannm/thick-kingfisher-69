import { DiagnosticBag } from "../diagnostics/diagnostic.bag";
import { Span } from "./token.span";
import { LineSpan } from "./line.span";
import { SyntaxKind } from "../parser/kind/syntax.kind";
import { SyntaxToken } from "../parser/syntax.token";
import { Lexer } from "../lexer";
import { SyntaxNodeKind } from "../parser/kind/syntax.node.kind";

export class SourceText {
  public tokens = Array<SyntaxToken<SyntaxKind>>();
  private lineSpans = new Array<LineSpan>();

  constructor(public text: string, public diagnostics: DiagnosticBag) {
    this.Lex();
  }

  static From(text: string, diagnostics: DiagnosticBag): SourceText {
    return new SourceText(text, diagnostics);
  }

  Lex(): SourceText {
    const tokenizer = new Lexer(this, this.diagnostics);
    var token: SyntaxToken<SyntaxKind>;
    do {
      token = tokenizer.Lex();
      this.tokens.push(token);
    } while (token.kind !== SyntaxNodeKind.EndOfFileToken);
    return this;
  }

  SetTokenSpan(start: number, end: number): Span {
    return new Span(this, start, end);
  }

  GetLineSpan(index: number): LineSpan {
    let left = 0;
    let right = this.lineSpans.length - 1;
    var pos: number;
    while (true) {
      pos = left + Math.floor((right - left) / 2);
      const lineSpan = this.lineSpans[pos];
      if (index >= lineSpan.start && index < lineSpan.end) {
        return lineSpan;
      }
      if (index < lineSpan.start) right = pos - 1;
      else left = pos + 1;
    }
  }

  GetToken(index: number): SyntaxToken<SyntaxKind> {
    var left = 0;
    var right = this.tokens.length - 1;
    var pos: number;
    if (!(index < this.text.length)) return this.tokens[this.tokens.length - 1];
    if (index < 0) return this.tokens[0];
    while (true) {
      pos = left + Math.floor((right - left) / 2);
      const token = this.tokens[pos];
      const span = token.GetSpan;
      if (index >= span.start && index < span.end) {
        return token;
      }
      if (index < span.start) right = pos - 1;
      else left = pos + 1;
    }
  }
}
