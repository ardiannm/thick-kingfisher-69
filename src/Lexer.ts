import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

export class Lexer {
  constructor(public input: string) {}

  private pointer = 0;

  isLetter(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
  }

  isDigit(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
  }

  isSpace(char: string): boolean {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
  }

  getChar(): string {
    return this.input.charAt(this.pointer);
  }

  advance(): void {
    this.pointer = this.pointer + 1;
  }

  hasMoreTokens(): boolean {
    return this.pointer < this.input.length;
  }

  getNextToken(): SyntaxToken {
    const char = this.getChar();

    if (this.isLetter(char)) {
      const start = this.pointer;
      while (this.isLetter(this.getChar())) {
        this.advance();
      }
      const view = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.IDENTIFIER_TOKEN, view);
    }

    if (this.isDigit(char)) {
      const start = this.pointer;
      while (this.isDigit(this.getChar())) {
        this.advance();
      }
      const view = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.NUMBER_TOKEN, view);
    }

    if (this.isSpace(char)) {
      const start = this.pointer;
      while (this.isSpace(this.getChar())) {
        this.advance();
      }
      const view = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.SPACE_TOKEN, view);
    }

    this.advance();

    if (char === "+") return new SyntaxToken(SyntaxKind.PLUS_TOKEN, "+");
    if (char === "-") return new SyntaxToken(SyntaxKind.PLUS_TOKEN, "-");
    if (char === "/") return new SyntaxToken(SyntaxKind.SLASH_TOKEN, "/");
    if (char === "*") return new SyntaxToken(SyntaxKind.STAR_TOKEN, "*");

    return new SyntaxToken(SyntaxKind.BAD_TOKEN, char);
  }
}
