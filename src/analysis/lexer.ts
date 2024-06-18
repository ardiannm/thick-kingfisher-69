import { SyntaxKind } from "./parser/kind/syntax.kind";
import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { BinaryOperatorKind } from "./parser/kind/binary.operator.kind";
import { SyntaxToken, TokenTextMapper } from "./parser/syntax.token";
import { SyntaxFacts } from "./parser/syntax.facts";
import { CompositeTokenKind } from "./parser/kind/composite.token.kind";
import { SyntaxTriviaKind } from "./parser/kind/syntax.trivia.kind";
import { DiagnosticBag } from "./diagnostics/diagnostic.bag";
import { SyntaxTree } from "./parser/syntax.tree";
import { TextSpan } from "./input/text.span";

export class Lexer {
  private kind: SyntaxKind;
  private end: number;
  private start: number;
  private trivia = new Array<SyntaxToken<SyntaxKind>>();
  public readonly diagnostics = new DiagnosticBag();

  constructor(private readonly tree: SyntaxTree) {
    this.kind = SyntaxNodeKind.EndOfFileToken;
    this.end = 0;
    this.start = this.end;
  }

  public lex(): SyntaxToken<SyntaxKind> {
    var token: SyntaxToken<SyntaxKind>;
    do {
      token = this.lexNextToken();
      if (SyntaxFacts.isTrivia(token.kind)) {
        this.trivia.push(token);
      } else {
        token.loadTrivias(this.trivia);
        return token;
      }
    } while (token.kind !== SyntaxNodeKind.EndOfFileToken);
    return token;
  }

  private lexNextToken() {
    this.start = this.end;
    this.kind = SyntaxFacts.syntaxKind(this.char()) as keyof TokenTextMapper;
    switch (this.kind) {
      case SyntaxNodeKind.BadToken:
        return this.lexBadToken();
      case SyntaxNodeKind.HashToken:
        return this.lexCommentToken();
      case BinaryOperatorKind.MinusToken:
        return this.lexMinusToken();
      case SyntaxNodeKind.GreaterToken:
        return this.lexGreaterGreaterToken();
      case SyntaxNodeKind.ColonToken:
        return this.lexColonColonToken();
    }
    this.next();
    return new SyntaxToken(this.tree, this.kind, this.getTextSpan());
  }

  private lexBadToken(): SyntaxToken<SyntaxKind> {
    if (this.isLetter()) {
      return this.lexIdentifier();
    }
    if (this.isDigit()) {
      return this.lexNumberToken();
    }
    if (this.isSpace()) {
      return this.lexSpaceToken();
    }
    this.diagnostics.badTokenFound(this.char());
    this.next();
    return new SyntaxToken(this.tree, this.kind, this.getTextSpan());
  }

  private lexCommentToken(): SyntaxToken<SyntaxKind> {
    do {
      this.next();
    } while (!(this.match(SyntaxTriviaKind.LineBreakTrivia) || this.match(SyntaxNodeKind.EndOfFileToken)));
    return new SyntaxToken(this.tree, SyntaxTriviaKind.CommentTrivia, this.getTextSpan());
  }

  private lexMinusToken(): SyntaxToken<SyntaxKind> {
    this.next();
    this.kind = BinaryOperatorKind.MinusToken;
    if (this.match(SyntaxNodeKind.GreaterToken)) {
      this.next();
      this.kind = CompositeTokenKind.PointerToken;
    }
    return new SyntaxToken(this.tree, this.kind, this.getTextSpan());
  }

  private lexGreaterGreaterToken(): SyntaxToken<SyntaxKind> {
    this.next();
    this.kind = SyntaxNodeKind.GreaterToken;
    if (this.match(SyntaxNodeKind.GreaterToken)) {
      this.next();
      this.kind = CompositeTokenKind.GreaterGreaterToken;
    }
    return new SyntaxToken(this.tree, this.kind, this.getTextSpan());
  }

  private lexColonColonToken(): SyntaxToken<SyntaxKind> {
    this.next();
    this.kind = SyntaxNodeKind.ColonToken;
    if (this.match(SyntaxNodeKind.ColonToken)) {
      this.next();
      this.kind = CompositeTokenKind.ColonColonToken;
    }
    return new SyntaxToken(this.tree, this.kind, this.getTextSpan());
  }

  private lexIdentifier(): SyntaxToken<SyntaxKind> {
    while (this.isLetter()) this.next();
    const span = this.getTextSpan();
    const text = this.tree.getText(span);
    return new SyntaxToken(this.tree, SyntaxFacts.isKeywordOrIdentifer(text), span);
  }

  private lexSpaceToken(): SyntaxToken<SyntaxKind> {
    while (this.isSpace()) this.next();
    return new SyntaxToken(this.tree, SyntaxTriviaKind.SpaceTrivia, this.getTextSpan());
  }

  private lexNumberToken(): SyntaxToken<SyntaxKind> {
    while (this.isDigit()) this.next();
    if (this.match(SyntaxNodeKind.DotToken)) {
      this.next();
      if (!this.isDigit()) {
        this.diagnostics.badFloatingPointNumber();
      }
    }
    while (this.isDigit()) this.next();
    return new SyntaxToken(this.tree, SyntaxNodeKind.NumberToken, this.getTextSpan());
  }

  private getTextSpan() {
    return new TextSpan(this.start, this.end);
  }

  private isSpace(): boolean {
    const char = this.char();
    return char === " " || char === "\t" || char === "\r";
  }

  private isDigit(): boolean {
    const charCode = this.char().charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
  }

  private isLetter(): boolean {
    const charCode = this.char().charCodeAt(0);
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
  }

  private peek(offset: number): string {
    return this.tree.getTextAt(this.end + offset);
  }

  private char() {
    return this.peek(0);
  }

  private next() {
    this.end = this.end + 1;
  }

  private match(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== SyntaxFacts.syntaxKind(this.peek(Offset))) return false;
      Offset++;
    }
    return true;
  }
}
