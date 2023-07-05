import { Error } from "./error.ts";
import { Identifier } from "./identifier.ts";
import { Number } from "./number.ts";
import { Plus } from "./plus.ts";
import { Token } from "./token.ts";

export class Tokenizer {
  private pointer = 0;
  constructor(public input: string) {}

  private getChar(): string {
    return this.input.charAt(this.pointer);
  }

  private advancePointer(): void {
    this.pointer++;
  }

  hasMoreTokens(): boolean {
    return this.input.length - this.pointer > 0;
  }

  private testNextChar(character: string): boolean {
    return this.getChar() === character;
  }

  private getNextChar(): string {
    const character = this.getChar();
    this.advancePointer();
    return character;
  }

  peekToken(): Token {
    const start = this.pointer;
    const token = this.getNextToken();
    this.pointer = start;
    return token;
  }

  getNextToken(): Token {
    if (this.testNextChar("+")) {
      return new Plus(this.getNextChar(), this.pointer, this.pointer + 1);
    }

    if (/[a-zA-Z]/.test(this.getChar())) {
      let identifier = "";
      while (/[a-zA-Z]/.test(this.getChar())) identifier += this.getNextChar();
      return new Identifier(identifier, this.pointer, this.pointer + 1);
    }

    if (/[0-9]/.test(this.getChar())) {
      let number = "";
      while (/[0-9]/.test(this.getChar())) number += this.getNextChar();
      return new Number(number, this.pointer, this.pointer + 1);
    }

    if (/\s/.test(this.getChar())) {
      while (/\s/.test(this.getChar())) this.getNextChar();
      return this.getNextToken();
    }

    return new Error(this.getNextChar(), this.pointer, this.pointer + 1);
  }
}
