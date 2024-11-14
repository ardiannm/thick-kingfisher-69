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
    } else if (this.isDigit()) {
      return this.lexNumberToken();
    } else if (this.isSpace()) {
      return this.lexSpaceToken();
    } else {
      return this.advanceAndCreateNewToken(SyntaxKind.BadToken);
    }
  }

  private advanceAndCreateNewToken(kind: Kind) {
    this.advance();
    return this.createNewToken(kind);
  }

  private createNewToken(kind: Kind) {
    return new Token(kind, this.span);
  }

  private get span() {
    return new Span(this.sourceText, this.start, this.end);
  }

  private lexIdentifier(): Token {
    this.advance();
    while (this.isLetter()) this.advance();
    return this.createNewToken(SyntaxKind.IdentifierToken);
  }

  private lexSpaceToken(): Token {
    this.advance();
    while (this.isSpace()) this.advance();
    return this.createNewToken(SyntaxKind.SpaceTrivia);
  }

  private lexNumberToken(): Token {
    this.advance();
    while (this.isDigit()) this.advance();
    if (this.char() === ".") {
      this.advance();
      if (!this.isDigit()) {
        this.sourceText.diagnostics.badFloatingPointNumber(this.span);
      }
    }
    while (this.isDigit()) this.advance();
    return this.createNewToken(SyntaxKind.NumberToken);
  }

  private lexCommentToken(): Token {
    this.advance();
    while (this.char() !== '"' && this.hasNext()) {
      this.advance();
    }
    if (this.char() === '"') {
      this.advance();
    } else {
      this.sourceText.diagnostics.unexpectedTokenFound(SyntaxKind.EndOfFileToken, SyntaxKind.QuoteToken, this.span);
    }
    return this.createNewToken(SyntaxKind.CommentTrivia);
  }

  private lexColonColonToken() {
    this.advance();
    if (this.char() === ":") {
      this.advance();
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

  private advance(steps = 1) {
    this.end = this.end + steps;
  }

  private hasNext() {
    return this.end < this.sourceText.text.length;
  }

  get diagnostics() {
    return this.sourceText.diagnostics.getDiagnostics();
  }
}
