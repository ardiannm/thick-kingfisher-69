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
import { Token } from "./definitions/token-definition.ts";
import { AmpersandToken } from "./definitions/tokens/ampersand.ts";
import { DotToken } from "./definitions/tokens/dot.ts";

export function Tokenizer(input: string) {
  let pointer = 0;
  const inputValue = input;

  function getChar() {
    return inputValue.charAt(pointer);
  }

  function advancePointer() {
    pointer++;
  }

  function hasMoreTokens() {
    return inputValue.length - pointer > 0;
  }

  function testNextChar(character: string) {
    return getChar() == character;
  }

  function getNextChar() {
    const character = getChar();
    advancePointer();
    return character;
  }

  function peekToken() {
    const start = pointer;
    const token = getNextToken();
    pointer = start;
    return token;
  }

  function getNextToken(): Token {
    if (testNextChar("+")) {
      return new PlusToken(getNextChar());
    }

    if (testNextChar("-")) {
      return new MinusToken(getNextChar());
    }

    if (testNextChar("*")) {
      return new MultiplicationToken(getNextChar());
    }

    if (testNextChar("/")) {
      return new DivisionToken(getNextChar());
    }

    if (testNextChar(":")) {
      return new ColonToken(getNextChar());
    }

    if (testNextChar("(")) {
      return new OpenParenthesisToken(getNextChar());
    }

    if (testNextChar(")")) {
      return new CloseParenthesisToken(getNextChar());
    }

    if (testNextChar("&")) {
      return new AmpersandToken(getNextChar());
    }

    if (testNextChar(".")) {
      return new DotToken(getNextChar());
    }

    if (/[a-zA-Z]/.test(getChar())) {
      let identifier = "";
      while (/[a-zA-Z]/.test(getChar())) {
        identifier += getNextChar();
      }
      return new IdentifierToken(identifier);
    }

    if (/[0-9]/.test(getChar())) {
      let number = "";
      while (/[0-9]/.test(getChar())) {
        number += getNextChar();
      }
      return new NumberToken(number);
    }

    if (/\s/.test(getChar())) {
      while (/\s/.test(getChar())) getNextChar();
      return getNextToken();
    }
    return new ErrorToken(getNextChar());
  }

  return { hasMoreTokens, getNextToken, peekToken };
}
