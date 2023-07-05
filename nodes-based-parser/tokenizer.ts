import { ColonToken } from "./definitions/tokens/colon.ts";
import { CloseParenthesisToken } from "./definitions/tokens/close.paranthesis.ts";
import { DivisionToken } from "./definitions/tokens/division.ts";
import { ErrorToken } from "./definitions/tokens/error.ts";
import { IdentifierToken } from "./definitions/tokens/identifier.ts";
import { MinusToken } from "./definitions/tokens/minus.ts";
import { MultiplicationToken } from "./definitions/tokens/multiplication.ts";
import { NumberToken } from "./definitions/tokens/number.ts";
import { OpenParenthesisToken } from "./definitions/tokens/open.paranthesis.ts";
import { PlusToken } from "./definitions/tokens/plus.ts";
import { Token } from "./definitions/token.definition.ts";
import { AmpersandToken } from "./definitions/tokens/ampersand.ts";
import { DotToken } from "./definitions/tokens/dot.ts";

export class Tokenizer {
  private pointer = 0;
  constructor(public input: string) {}

  getChar(): string {
    return this.input.charAt(this.pointer);
  }

  advancePointer(): void {
    this.pointer++;
  }

  hasMoreTokens(): boolean {
    return this.input.length - this.pointer > 0;
  }

  testNextChar(character: string): boolean {
    return this.getChar() === character;
  }

  getNextChar(): string {
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
      return new PlusToken(this.getNextChar());
    }

    if (this.testNextChar("-")) {
      return new MinusToken(this.getNextChar());
    }

    if (this.testNextChar("*")) {
      return new MultiplicationToken(this.getNextChar());
    }

    if (this.testNextChar("/")) {
      return new DivisionToken(this.getNextChar());
    }

    if (this.testNextChar(":")) {
      return new ColonToken(this.getNextChar());
    }

    if (this.testNextChar("(")) {
      return new OpenParenthesisToken(this.getNextChar());
    }

    if (this.testNextChar(")")) {
      return new CloseParenthesisToken(this.getNextChar());
    }

    if (this.testNextChar("&")) {
      return new AmpersandToken(this.getNextChar());
    }

    if (this.testNextChar(".")) {
      return new DotToken(this.getNextChar());
    }

    if (/[a-zA-Z]/.test(this.getChar())) {
      let identifier = "";
      while (/[a-zA-Z]/.test(this.getChar())) identifier += this.getNextChar();
      return new IdentifierToken(identifier);
    }

    if (/[0-9]/.test(this.getChar())) {
      let number = "";
      while (/[0-9]/.test(this.getChar())) number += this.getNextChar();
      return new NumberToken(number);
    }

    if (/\s/.test(this.getChar())) {
      while (/\s/.test(this.getChar())) this.getNextChar();
      return this.getNextToken();
    }

    return new ErrorToken(this.getNextChar());
  }
}
