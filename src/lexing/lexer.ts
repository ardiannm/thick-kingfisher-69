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

  private lexNextToken(): Token {
    this.start = this.end;
    switch (this.char()) {
      case "":
        return this.createNewToken(SyntaxKind.EndOfFileToken);
      case "+":
        return this.advanceAndCreateNewToken(SyntaxKind.PlusToken);
      case "-":
        return this.advanceAndCreateNewToken(SyntaxKind.MinusToken);
      case "*":
        return this.advanceAndCreateNewToken(SyntaxKind.StarToken);
      case "/":
        return this.advanceAndCreateNewToken(SyntaxKind.SlashToken);
      case "^":
        return this.advanceAndCreateNewToken(SyntaxKind.HatToken);
      case "(":
        return this.advanceAndCreateNewToken(SyntaxKind.OpenParenthesisToken);
      case ")":
        return this.advanceAndCreateNewToken(SyntaxKind.CloseParenthesisToken);
      case ".":
        return this.advanceAndCreateNewToken(SyntaxKind.DotToken);
      case "\n":
        return this.advanceAndCreateNewToken(SyntaxKind.LineBreakTrivia);
      case '"':
        return this.lexCommentToken();
      case ":":
        return this.lexColonColonToken();
    }
    if (this.isLetter()) {
      return this.lexIdentifier();
    }
    if (this.isDigit()) {
      return this.lexNumberToken();
    }
    if (this.isSpace()) {
      return this.lexSpaceToken();
    }
    return this.lexBadToken();
  }

  private lexBadToken() {
    this.sourceText.diagnostics.badCharacterFound(this.char(), this.span);
    this.next();
    return this.createNewToken(SyntaxKind.BadToken);
  }

  private advanceAndCreateNewToken(kind: Kind) {
    this.next();
    return this.createNewToken(kind);
  }

  private createNewToken(kind: Kind) {
    return new Token(kind, this.span);
  }

  private get span() {
    return new Span(this.sourceText, this.start, this.end);
  }

  private lexIdentifier(): Token {
    this.next();
    while (this.isLetter()) this.next();
    return this.createNewToken(SyntaxKind.IdentifierToken);
  }

  private lexSpaceToken(): Token {
    this.next();
    while (this.isSpace()) this.next();
    return this.createNewToken(SyntaxKind.SpaceTrivia);
  }

  private lexNumberToken(): Token {
    this.next();
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
    while (this.char() !== '"' && this.hasNext()) {
      this.next();
    }
    if (this.char() === '"') {
      this.next();
    } else {
      this.sourceText.diagnostics.missingClosingQuote(this.span);
    }
    return this.createNewToken(SyntaxKind.CommentTrivia);
  }

  private lexColonColonToken() {
    this.next();
    if (this.char() === ":") {
      this.next();
      return this.createNewToken(SyntaxKind.ColonColonToken);
    }
    return this.createNewToken(SyntaxKind.ColonToken);
  }

  private isSpace(): boolean {
    const char = this.char();
    return char === " " || char === "\t" || char === "\r";
  }

  private isDigit(): boolean {
    const char = this.char();
    return char >= "0" && char <= "9";
  }

  private isLetter(): boolean {
    const char = this.char();
    return (char >= "A" && char <= "Z") || (char >= "a" && char <= "z");
  }

  private peek(offset: number): string {
    const index = this.end + offset;
    if (index >= this.sourceText.text.length) {
      return "";
    }
    return this.sourceText.text[index];
  }

  private char() {
    return this.peek(0);
  }

  private next(steps = 1) {
    this.end += steps;
  }

  private hasNext() {
    return this.end < this.sourceText.text.length;
  }

  get diagnostics() {
    return this.sourceText.diagnostics.getDiagnostics();
  }
}
