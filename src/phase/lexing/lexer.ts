import { SourceText } from "./source.text";
import { Span } from "./span";
import { SyntaxKind } from "../parsing/syntax.kind";
import { SyntaxToken } from "./syntax.token";

export class Lexer {
  private start: number = 0;
  private position = this.start;

  private constructor(private readonly source: SourceText) {}

  static createFrom(source: SourceText) {
    return new Lexer(source);
  }

  *lex(): Generator<SyntaxToken> {
    while (this.hasNext()) yield this.lexNextToken();
    yield this.lexNextToken();
  }

  private lexNextToken(): SyntaxToken {
    this.start = this.position;
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
      case "{":
        return this.advanceAndCreateNewToken(SyntaxKind.OpenBraceToken);
      case "}":
        return this.advanceAndCreateNewToken(SyntaxKind.CloseBraceToken);
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
    const token = this.advanceAndCreateNewToken(SyntaxKind.BadToken);
    this.source.diagnostics.reportBadCharacterFound(token.span.text, token.span);
    return token;
  }

  private advanceAndCreateNewToken(kind: SyntaxKind) {
    this.next();
    return this.createNewToken(kind);
  }

  private createNewToken(kind: SyntaxKind) {
    return new SyntaxToken(this.source, kind, this.span);
  }

  private get span() {
    return Span.createFrom(this.source, this.start, this.position);
  }

  private lexIdentifier(): SyntaxToken {
    this.next();
    while (this.isLetter()) this.next();
    return this.createNewToken(SyntaxKind.IdentifierToken);
  }

  private lexSpaceToken(): SyntaxToken {
    this.next();
    while (this.isSpace()) this.next();
    return this.createNewToken(SyntaxKind.SpaceTrivia);
  }

  private lexNumberToken(): SyntaxToken {
    this.next();
    while (this.isDigit()) this.next();
    if (this.char() === ".") {
      this.next();
      if (!this.isDigit()) {
        this.source.diagnostics.reportBadFloatingPointNumber(this.span);
      }
    }
    while (this.isDigit()) this.next();
    return this.createNewToken(SyntaxKind.NumberToken);
  }

  private lexCommentToken(): SyntaxToken {
    this.next();
    while (this.hasNext()) {
      if (this.char() === '"') {
        this.next();
        return this.createNewToken(SyntaxKind.CommentTrivia);
      }
      this.next();
    }
    this.source.diagnostics.reportMissingClosingQuote(this.span);
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
    const index = this.position + offset;
    return index >= this.source.text.length ? "" : this.source.text[index];
  }

  private char() {
    return this.peek(0);
  }

  private next(steps = 1) {
    this.position += steps;
  }

  private hasNext() {
    return this.position < this.source.text.length;
  }
}
