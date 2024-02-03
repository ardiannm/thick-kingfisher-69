import { SyntaxFacts } from "../CodeAnalysis/Parsing/SyntaxFacts";
import { SyntaxKind } from "../CodeAnalysis/Parsing/Kind/SyntaxKind";
import { SyntaxNodeKind } from "../CodeAnalysis/Parsing/Kind/SyntaxNodeKind";
import { Lexer } from "../CodeAnalysis/Lexer";
import { SyntaxToken } from "../CodeAnalysis/Parsing/SyntaxToken";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { LineSpan } from "./LineSpan";
import { TextSpan } from "./TextSpan";

export class Submission {
  private Index = 0;
  private LineSpans = new Array<LineSpan>();

  constructor(public Text: string) {
    this.SetLineSpans();
  }

  static From(Text: string) {
    return new Submission(Text);
  }

  Lex(Diagnostics: DiagnosticBag) {
    const Tokens = new Array<SyntaxToken<SyntaxKind>>();
    const Tokenizer = new Lexer(this, Diagnostics);
    var Token: SyntaxToken<SyntaxKind>;
    do {
      Token = Tokenizer.Lex();
      Tokens.push(Token);
    } while (Token.Kind !== SyntaxNodeKind.EndOfFileToken);
    return Tokens;
  }

  SetTextSpan(Start: number, End: number) {
    return new TextSpan(this, Start, End);
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

  GetLineIndex(TextSpan: TextSpan) {
    let Left = 0;
    let Right = this.LineSpans.length - 1;
    while (true) {
      const Index = Left + Math.floor((Right - Left) / 2);
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
}
