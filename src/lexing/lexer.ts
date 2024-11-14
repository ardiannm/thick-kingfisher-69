import { Token } from "./token";
import { SourceText } from "./source.text";
import { Span } from "./span";
import { Kind, SyntaxKind } from "../analysis/parsing/syntax.kind";

export class Lexer {
  private start: number = 0;
  private end = this.start;

  private constructor(private readonly sourceText: SourceText) {}

  static createFrom(text: string | SourceText) {
    const sourceText = text instanceof SourceText ? text : SourceText.createFrom(text);
    return new Lexer(sourceText);
  }

  *lex(): Generator<Token> {
    while (this.hasNext()) yield this.lexNextToken();
    yield this.lexNextToken();
  }

  private lexNextToken() {
    this.start = this.end;
    switch (this.char()) {
      case "":
        return this.createNewToken(SyntaxKind.EndOfFileToken);
      case "+":
        this.next();
        return this.createNewToken(SyntaxKind.PlusToken);
      case "-":
        this.next();
        return this.createNewToken(SyntaxKind.MinusToken);
      case "*":
        this.next();
        return this.createNewToken(SyntaxKind.StarToken);
      case "/":
        this.next();
        return this.createNewToken(SyntaxKind.SlashToken);
      case "^":
        this.next();
        return this.createNewToken(SyntaxKind.HatToken);
      case "(":
        this.next();
        return this.createNewToken(SyntaxKind.OpenParenthesisToken);
      case ")":
        this.next();
        return this.createNewToken(SyntaxKind.CloseParenthesisToken);
      case '"':
        return this.lexCommentToken();
      default:
        if (this.isLetter()) {
          return this.lexIdentifier();
        } else if (this.isDigit()) {
          return this.lexNumberToken();
        } else if (this.isSpace()) {
          return this.lexSpaceToken();
        } else {
          this.next();
          return this.createNewToken(SyntaxKind.BadToken);
        }
    }
  }

  private createNewToken(kind: Kind) {
    return new Token(kind, this.span);
  }

  private get span() {
    return new Span(this.sourceText, this.start, this.end);
  }

  private lexIdentifier(): Token {
    while (this.isLetter()) this.next();
    return this.createNewToken(SyntaxKind.IdentifierToken);
  }

  private lexSpaceToken(): Token {
    while (this.isSpace()) this.next();
    return this.createNewToken(SyntaxKind.SpaceTrivia);
  }

  private lexNumberToken(): Token {
    while (this.isDigit()) this.next();
    if (this.char() === ".") {
      this.next();
      if (!this.isDigit()) {
        this.sourceText.diagnostics.badFloatingPointNumber(this.span);
      }
    }
    while (this.isDigit()) this.next();
    return this.createNewToken(SyntaxKind.NumberToken);
  }

  private lexCommentToken(): Token {
    this.next();
    while (this.hasNext()) {
      this.next();
      if (this.char() === '"') break;
    }
    if (this.char() === '"') {
      this.next();
    } else {
      this.sourceText.diagnostics.unexpectedTokenFound(SyntaxKind.EndOfFileToken, SyntaxKind.QuoteToken, this.span);
    }
    return this.createNewToken(SyntaxKind.CommentTrivia);
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
    const start = this.end + offset;
    return this.sourceText.text.substring(start, start + 1);
  }

  private char() {
    return this.peek(0);
  }

  private next(steps = 1) {
    this.end = this.end + steps;
  }

  private hasNext() {
    return this.end < this.sourceText.text.length;
  }

  get diagnostics() {
    return this.sourceText.diagnostics.getDiagnostics();
  }
}
