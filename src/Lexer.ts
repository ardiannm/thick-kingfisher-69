import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

export class Lexer {
  constructor(public input: string) {}

  private pointer = 0;

  private isLetter(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
  }

  private isDigit(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
  }

  private isSpace(char: string): boolean {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
  }

  private getChar(): string {
    return this.input.charAt(this.pointer);
  }

  private advance(): void {
    this.pointer = this.pointer + 1;
  }

  getNextToken(): SyntaxToken {
    const start = this.pointer;
    const char = this.getChar();

    if (this.isLetter(char)) {
      while (this.isLetter(this.getChar())) {
        this.advance();
      }
      const text = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.IndentifierToken, text, start);
    }

    if (this.isDigit(char)) {
      while (this.isDigit(this.getChar())) {
        this.advance();
      }
      const text = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.NumberToken, text, start);
    }

    if (this.isSpace(char)) {
      while (this.isSpace(this.getChar())) {
        this.advance();
      }
      const text = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.SpaceToken, text, start);
    }

    this.advance();

    const kind = SyntaxFacts.Kind(char);
    return new SyntaxToken(kind, char, start);
  }
}
