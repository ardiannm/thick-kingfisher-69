import { Division } from "./division.ts";
import { Error } from "./error.ts";
import { Identifier } from "./identifier.ts";
import { Minus } from "./minus.ts";
import { Multiplication } from "./multiplication.ts";
import { Number } from "./number.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { Particle } from "./particle.ts";
import { Plus } from "./plus.ts";
import { Quote } from "./quote.ts";

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

  peekToken(): Particle {
    const start = this.pointer;
    const token = this.getNextToken();
    this.pointer = start;
    return token;
  }

  getNextToken(): Particle {
    if (this.testNextChar("+")) {
      return new Plus(this.getNextChar());
    }
    if (this.testNextChar("-")) {
      return new Minus(this.getNextChar());
    }
    if (this.testNextChar("*")) {
      return new Multiplication(this.getNextChar());
    }
    if (this.testNextChar("/")) {
      return new Division(this.getNextChar());
    }
    if (this.testNextChar("(")) {
      return new OpenParenthesis(this.getNextChar());
    }
    if (this.testNextChar("\"")) {
      return new Quote(this.getNextChar());
    }
    if (/[a-zA-Z]/.test(this.getChar())) {
      let identifier = "";
      while (/[a-zA-Z]/.test(this.getChar())) identifier += this.getNextChar();
      return new Identifier(identifier);
    }
    if (/[0-9]/.test(this.getChar())) {
      let number = "";
      while (/[0-9]/.test(this.getChar())) number += this.getNextChar();
      return new Number(number);
    }
    if (/\s/.test(this.getChar())) {
      while (/\s/.test(this.getChar())) this.getNextChar();
      return this.getNextToken();
    }
    return new Error(this.getNextChar());
  }
}
