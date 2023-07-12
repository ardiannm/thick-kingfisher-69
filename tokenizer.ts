import { Primitive } from "./primitive.ts";
import { CloseParenthesis } from "./close.parenthesis.ts";
import { Division } from "./division.ts";
import { Identifier } from "./identifier.ts";
import { Minus } from "./minus.ts";
import { Multiplication } from "./multiplication.ts";
import { Number } from "./number.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { Plus } from "./plus.ts";
import { Quote } from "./quote.ts";
import { WhiteSpace } from "./white.space.ts";
import { Power } from "./power.ts";
import { EOF } from "./eof.ts";
import { Illegal } from "./illegal.ts";

export class Tokenizer {
  private pointer = 0;
  private whiteSpace = false;
  constructor(public input: string) {}

  keepWhiteSpace() {
    this.whiteSpace = true;
  }

  ignoreWhiteSpace() {
    this.whiteSpace = false;
  }

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

  peekToken(): Primitive {
    const start = this.pointer;
    const token = this.getNextToken();
    this.pointer = start;
    return token;
  }

  getNextToken(): Primitive {
    if (this.testNextChar("+")) {
      return new Plus(this.getNextChar());
    }
    if (this.testNextChar("-")) {
      return new Minus(this.getNextChar());
    }
    if (this.testNextChar("*")) {
      const multiply = this.getNextChar();
      if (this.testNextChar("*")) {
        return new Power(multiply + this.getNextChar());
      }
      return new Multiplication(multiply);
    }
    if (this.testNextChar("/")) {
      return new Division(this.getNextChar());
    }
    if (this.testNextChar("(")) {
      return new OpenParenthesis(this.getNextChar());
    }
    if (this.testNextChar(")")) {
      return new CloseParenthesis(this.getNextChar());
    }
    if (this.testNextChar('"')) {
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
      let whiteSpace = "";
      while (/\s/.test(this.getChar())) whiteSpace += this.getNextChar();
      if (this.whiteSpace) return new WhiteSpace(whiteSpace);
      return this.getNextToken();
    }
    if (this.hasMoreTokens()) {
      return new Illegal(this.getNextChar());
    }
    return new EOF();
  }
}
