import { SyntaxKind } from "./parser/kind/syntax.kind";
import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { SyntaxBinaryOperatorKind } from "./parser/kind/syntax.binary.operator.kind";
import { SyntaxToken } from "./parser/syntax.token";
import { TokenTextMapper } from "./parser/token.text.warpper";
import { SyntaxFacts } from "./parser/syntax.facts";
import { SyntaxCompositeTokenKind } from "./parser/kind/syntax.composite.token.kind";
import { SyntaxTriviaKind } from "./parser/kind/syntax.trivia.kind";
import { SyntaxTree } from "../runtime/syntax.tree";
import { Span } from "./text/span";

export class Lexer {
  private kind: SyntaxKind;
  private start: number;
  private end: number;
  private trivias = new Array<SyntaxToken<SyntaxKind>>();

  constructor(private readonly tree: SyntaxTree) {
    this.kind = SyntaxNodeKind.EndOfFileToken;
    this.start = 0;
    this.end = this.start;
  }

  public lex(): SyntaxToken<SyntaxKind> {
    var token: SyntaxToken<SyntaxKind>;
    do {
      token = this.lexNextToken();
      if (SyntaxFacts.isTrivia(token.kind)) {
        this.trivias.push(token);
      } else {
        token.loadTrivias(this.trivias);
        return token;
      }
    } while (token.kind !== SyntaxNodeKind.EndOfFileToken);
    return token;
  }

  private lexNextToken() {
    this.start = this.end;
    this.kind = SyntaxFacts.syntaxKind(this.char()) as keyof TokenTextMapper;
    if (this.match(SyntaxNodeKind.SingleQuoteToken, SyntaxNodeKind.SingleQuoteToken, SyntaxNodeKind.SingleQuoteToken)) {
      return this.lexMultilineCommentToken();
    }
    if (this.match(SyntaxCompositeTokenKind.GreaterGreaterToken, SyntaxCompositeTokenKind.GreaterGreaterToken)) {
      return this.lexGreaterGreaterToken();
    }
    switch (this.kind) {
      case SyntaxNodeKind.BadToken:
        return this.lexBadToken();
      case SyntaxNodeKind.HashToken:
        return this.lexCommentToken();
      case SyntaxBinaryOperatorKind.MinusToken:
        return this.lexMinusToken();
      case SyntaxNodeKind.ColonToken:
        return this.lexColonColonToken();
    }
    this.next();
    return new SyntaxToken(this.tree, this.kind, this.createSpan());
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
    const character = this.char();
    this.next();
    const span = this.createSpan();
    this.tree.diagnostics.badCharacterFound(character, span);
    return new SyntaxToken(this.tree, this.kind, span);
  }

  private lexMultilineCommentToken() {
    this.next(3);
    while (!(this.match(SyntaxNodeKind.EndOfFileToken) || this.match(SyntaxNodeKind.SingleQuoteToken, SyntaxNodeKind.SingleQuoteToken, SyntaxNodeKind.SingleQuoteToken))) {
      this.next();
    }
    if (this.match(SyntaxNodeKind.SingleQuoteToken, SyntaxNodeKind.SingleQuoteToken, SyntaxNodeKind.SingleQuoteToken)) {
      this.next(3);
    } else {
      this.tree.diagnostics.missingTripleQuotes(this.createSpan());
    }
    return new SyntaxToken(this.tree, SyntaxTriviaKind.MultilineCommentTrivia, this.createSpan());
  }

  private lexCommentToken(): SyntaxToken<SyntaxKind> {
    do {
      this.next();
    } while (!(this.match(SyntaxTriviaKind.LineBreakTrivia) || this.match(SyntaxNodeKind.EndOfFileToken)));
    return new SyntaxToken(this.tree, SyntaxTriviaKind.CommentTrivia, this.createSpan());
  }

  private lexMinusToken(): SyntaxToken<SyntaxKind> {
    this.next();
    this.kind = SyntaxBinaryOperatorKind.MinusToken;
    if (this.match(SyntaxNodeKind.GreaterToken)) {
      this.next();
      this.kind = SyntaxCompositeTokenKind.PointerToken;
    }
    return new SyntaxToken(this.tree, this.kind, this.createSpan());
  }

  private lexGreaterGreaterToken(): SyntaxToken<SyntaxKind> {
    this.next(2);
    this.kind = SyntaxCompositeTokenKind.GreaterGreaterToken;
    return new SyntaxToken(this.tree, this.kind, this.createSpan());
  }

  private lexColonColonToken(): SyntaxToken<SyntaxKind> {
    this.next();
    this.kind = SyntaxNodeKind.ColonToken;
    if (this.match(SyntaxNodeKind.ColonToken)) {
      this.next();
      this.kind = SyntaxCompositeTokenKind.ColonColonToken;
    }
    return new SyntaxToken(this.tree, this.kind, this.createSpan());
  }

  private lexIdentifier(): SyntaxToken<SyntaxKind> {
    while (this.isLetter()) this.next();
    const span = this.createSpan();
    const text = this.tree.sourceText.get(span.start, span.end);
    return new SyntaxToken(this.tree, SyntaxFacts.isKeywordOrIdentifer(text), span);
  }

  private lexSpaceToken(): SyntaxToken<SyntaxKind> {
    while (this.isSpace()) this.next();
    return new SyntaxToken(this.tree, SyntaxTriviaKind.SpaceTrivia, this.createSpan());
  }

  private lexNumberToken(): SyntaxToken<SyntaxKind> {
    while (this.isDigit()) this.next();
    if (this.match(SyntaxNodeKind.DotToken)) {
      this.next();
      if (!this.isDigit()) {
        this.tree.diagnostics.badFloatingPointNumber(this.createSpan());
      }
    }
    while (this.isDigit()) this.next();
    return new SyntaxToken(this.tree, SyntaxNodeKind.NumberToken, this.createSpan());
  }

  private createSpan() {
    return Span.createFrom(this.tree.sourceText, this.start, this.end);
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
    return this.tree.sourceText.get(this.end + offset);
  }

  private char() {
    return this.peek(0);
  }

  private next(steps = 1) {
    this.end = this.end + steps;
  }

  private match(...kinds: Array<SyntaxKind>) {
    let offset = 0;
    for (const kind of kinds) {
      if (kind !== SyntaxFacts.syntaxKind(this.peek(offset))) return false;
      offset++;
    }
    return true;
  }
}
