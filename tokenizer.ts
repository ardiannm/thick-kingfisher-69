import { Division } from "./division.ts";
import { Error } from "./error.ts";
import { Identifier } from "./identifier.ts";
import { Minus } from "./minus.ts";
import { Multiplication } from "./multiplication.ts";
import { Number } from "./number.ts";
import { Plus } from "./plus.ts";
import { Token } from "./token.ts";

export class Tokenizer {
  private pointer = 0;
  constructor(public input: string) { }

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
      return new Plus(this.getNextChar(), this.pointer);
    }

    if (this.testNextChar("-")) {
      return new Minus(this.getNextChar(), this.pointer);
    }

    if (this.testNextChar("*")) {
      return new Multiplication(this.getNextChar(), this.pointer);
    }

    if (this.testNextChar("/")) {
      return new Division(this.getNextChar(), this.pointer);
    }

    if (/[a-zA-Z]/.test(this.getChar())) {
      let identifier = "";
      while (/[a-zA-Z]/.test(this.getChar())) identifier += this.getNextChar();
      return new Identifier(identifier, this.pointer);
    }

    if (/[0-9]/.test(this.getChar())) {
      let number = "";
      while (/[0-9]/.test(this.getChar())) number += this.getNextChar();
      return new Number(number, this.pointer);
    }

    if (/\s/.test(this.getChar())) {
      while (/\s/.test(this.getChar())) this.getNextChar();
      return this.getNextToken();
    }

    return new Error(this.getNextChar(), this.pointer);
  }
}
