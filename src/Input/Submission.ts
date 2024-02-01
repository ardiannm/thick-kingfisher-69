import { SyntaxFacts } from "../CodeAnalysis/Parser/SyntaxFacts";
import { SyntaxKind } from "../CodeAnalysis/Parser/Kind/SyntaxKind";
import { SyntaxNodeKind } from "../CodeAnalysis/Parser/Kind/SyntaxNodeKind";
import { Lexer } from "../CodeAnalysis/Parser/Lexer";
import { SyntaxToken } from "../CodeAnalysis/Parser/SyntaxToken";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { LineSpan } from "./LineSpan";
import { TextSpan } from "./TextSpan";

export class Submission {
  private Index = 0;
  private LineSpans = new Array<LineSpan>();
  private LineIndex = 1;

  constructor(public Text: string) {
    this.SetLineSpans();
  }

  static From(Text: string) {
    return new Submission(Text);
  }

  Lex(Diagnostics: DiagnosticBag) {
    const Tokens = new Array<SyntaxToken<SyntaxKind>>();
    const Trivias = new Array<SyntaxToken<SyntaxKind>>();
    const Tokenizer = new Lexer(this, Diagnostics);
    var Token: SyntaxToken<SyntaxKind>;
    do {
      Token = Tokenizer.Lex();
      if (SyntaxFacts.IsTrivia(Token.Kind)) {
        Trivias.push(Token);
      } else {
        Tokens.push(Token.EatTrivia(Trivias));
      }
    } while (Token.Kind !== SyntaxNodeKind.EndOfFileToken);
    return Tokens;
  }

  SetTextSpan(Start: number, End: number) {
    return new TextSpan(this, Start, End);
  }

  private SetLineSpans() {
    let Start = this.Index;
    while (this.Index < this.Text.length) {
      const Char = this.Text.charAt(this.Index);
      if (Char === "\n") {
        const Span = new LineSpan(this.LineIndex, Start, this.Index);
        this.LineSpans.push(Span);
        this.LineIndex++;
        Start = this.Index;
      }
      this.Index++;
    }
    const Span = new LineSpan(this.LineIndex, Start, this.Index + 1); // add +1 to account for EOF token;
    this.LineSpans.push(Span);
    return this.LineSpans;
  }

  GetLineIndex(TextSpan: TextSpan): LineSpan {
    let Left = 0;
    let Right = this.LineSpans.length - 1;
    while (true) {
      const Index = Left + Math.floor((Right - Left) / 2);
      const LineSpan = this.LineSpans[Index];
      if (TextSpan.Start >= LineSpan.Start && TextSpan.Start < LineSpan.End) {
        return LineSpan;
      }
      if (TextSpan.Start < LineSpan.Start) Right = Index - 1;
      else Left = Index + 1;
    }
  }
}
