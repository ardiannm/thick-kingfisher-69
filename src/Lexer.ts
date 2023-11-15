import { SyntaxKind } from "./Syntax/SyntaxKind";
import { SyntaxToken } from "./Syntax/SyntaxToken";
import { SyntaxFacts } from "./Syntax/SyntaxFacts";

export class Lexer {
  constructor(public input: string) {}

  private pointer = 0;

  public IsSpace(char: string): boolean {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
  }

  private IsDigit(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
  }

  private IsLetter(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
  }

  public GetChar(): string {
    return this.input.charAt(this.pointer);
  }

  private Advance(): void {
    this.pointer = this.pointer + 1;
  }

  NextToken(): SyntaxToken {
    const start = this.pointer;
    const char = this.GetChar();

    if (this.IsLetter(char)) {
      while (this.IsLetter(this.GetChar())) {
        this.Advance();
      }
      const text = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.IndentifierToken, text, start);
    }

    if (this.IsDigit(char)) {
      while (this.IsDigit(this.GetChar())) {
        this.Advance();
      }
      const text = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.NumberToken, text, start);
    }

    if (this.IsSpace(char)) {
      while (this.IsSpace(this.GetChar())) {
        this.Advance();
      }
      const text = this.input.substring(start, this.pointer);
      return new SyntaxToken(SyntaxKind.SpaceToken, text, start);
    }

    this.Advance();
    const kind = SyntaxFacts.Kind(char);
    return new SyntaxToken(kind, char, start);
  }
}
