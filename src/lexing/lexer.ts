import { Token } from "./token";
import { SourceText } from "./source.text";
import { TextSpan } from "./text.span";
import { Kind, SyntaxKind } from "../analysis/parsing/syntax.kind";

export class Lexer {
  private start: number = 0;
  private end = this.start;

  private constructor(private readonly sourceText: SourceText) {}

  static createFrom(text: SourceText) {
    return new Lexer(text);
  }

  *lex(): Generator<Token> {
    let token: Token;
    do {
      token = this.lexNextToken();
      yield token;
    } while (this.hasNext());
  }

  private lexNextToken() {
    this.start = this.end;
    switch (this.char()) {
      case "":
        this.next();
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
    return TextSpan.createFrom(this.sourceText, this.start, this.end, 0);
  }

  private lexIdentifier(): Token {
    while (this.isLetter()) this.next();
    const span = this.span;
    return new Token(SyntaxKind.IdentifierToken, span);
  }

  private lexSpaceToken(): Token {
    while (this.isSpace()) this.next();
    return new Token(SyntaxKind.SpaceTrivia, this.span);
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
    return new Token(SyntaxKind.NumberToken, this.span);
  }

  private lexCommentToken(): Token {
    this.next();
    while (this.char() !== '"' && this.hasNext()) {
      this.next();
    }
    return new Token(SyntaxKind.CommentTrivia, this.span);
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
}
