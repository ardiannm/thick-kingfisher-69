import { ColonToken } from "./tokens/colon";
import { CloseParenthesisToken } from "./tokens/close.paranthesis";
import { DivisionToken } from "./tokens/division";
import { ErrorToken } from "./tokens/error";
import { IdentifierToken } from "./tokens/identifier";
import { MinusToken } from "./tokens/minus";
import { MultiplicationToken } from "./tokens/multiplication";
import { NumberToken } from "./tokens/number";
import { OpenParenthesisToken } from "./tokens/open.paranthesis";
import { PlusToken } from "./tokens/plus";
import { Token } from "./token-definition";
import { AmpersandToken } from "./tokens/ampersand";
import { DotToken } from "./tokens/dot";

export function Lexer(input: string) {
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
