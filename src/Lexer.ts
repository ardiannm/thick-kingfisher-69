import SyntaxToken from "./ast/tokens/SyntaxToken";
import CloseParenthesis from "./ast/tokens/CloseParenthesis";
import Number from "./ast/expressions/Number";
import Identifier from "./ast/expressions/Identifier";
import Power from "./ast/operators/Power";
import ExclamationMark from "./ast/tokens/ExclamationMark";
import Minus from "./ast/operators/Minus";
import Slash from "./ast/operators/Slash";
import Quote from "./ast/tokens/Quote";
import LessThan from "./ast/tokens/LessThan";
import Plus from "./ast/operators/Plus";
import Comma from "./ast/tokens/Comma";
import GreaterThan from "./ast/tokens/GreaterThan";
import Equals from "./ast/tokens/Equals";
import Product from "./ast/operators/Product";
import Space from "./ast/tokens/Space";
import SemiColon from "./ast/tokens/SemiColon";
import Colon from "./ast/tokens/Colon";
import BadToken from "./ast/tokens/BadToken";
import EOF from "./ast/tokens/EOF";
import OpenParenthesis from "./ast/tokens/OpenParenthesis";
import BackSlash from "./ast/tokens/BackSlash";
import OpenBrace from "./ast/tokens/OpenBrace";
import CloseBrace from "./ast/tokens/CloseBrace";
import Dot from "./ast/tokens/Dot";

function Lexer(input: string) {
  let pointer = 0;
  let id = 1;
  let line = 1;
  let column = 1;
  let space = false;

  function state() {
    return { pointer, line, column };
  }

  function peekToken(): SyntaxToken {
    let prevPointer = pointer;
    const prevId = id;
    const prevLine = line;
    const prevColumn = column;
    const token = getNextToken();
    pointer = prevPointer;
    id = prevId;
    line = prevLine;
    column = prevColumn;
    return token;
  }

  function hasMoreTokens(): boolean {
    return !(peekToken() instanceof EOF);
  }

  function getNextToken(): SyntaxToken {
    const char = peek();

    if (isLetter(char)) return getIdentifier();
    else if (isDigit(char)) return getNumber();
    else if (isSpace(char)) return getSpace();

    const next = getNext();

    switch (char) {
      case "":
        return new EOF();
      case ",":
        return new Comma(next);
      case ":":
        return new Colon(next);
      case ";":
        return new SemiColon(next);
      case "(":
        return new OpenParenthesis(next);
      case ")":
        return new CloseParenthesis(next);
      case "!":
        return new ExclamationMark(next);
      case "<":
        return new LessThan(next);
      case ">":
        return new GreaterThan(next);
      case "+":
        return new Plus(next);
      case "-":
        return new Minus(next);
      case "*":
        return new Product(next);
      case "/":
        return new Slash(next);
      case "^":
        return new Power(next);
      case "\\":
        return new BackSlash(next);
      case '"':
        return new Quote(next);
      case "=":
        return new Equals(next);
      case "{":
        return new OpenBrace(next);
      case "}":
        return new CloseBrace(next);
      case ".":
        return new Dot(next);

      default:
        return new BadToken(next);
    }
  }

  function isLetter(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
  }

  function isDigit(char: string): boolean {
    const charCode = char.charCodeAt(0);
    return charCode >= 48 && charCode <= 57;
  }

  function isSpace(char: string): boolean {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
  }

  function getNumber() {
    let view = "";
    while (isDigit(peek())) view += getNext();
    return new Number(view);
  }

  function getSpace() {
    let view = "";
    while (isSpace(peek())) view += getNext();
    if (space) return new Space(view);
    return getNextToken();
  }

  function getIdentifier() {
    let view = "";
    while (isLetter(peek())) view += getNext();
    return new Identifier(view);
  }

  function peek() {
    return input.charAt(pointer);
  }

  function getNext() {
    const character = peek();
    if (character) {
      pointer = pointer + 1;
      if (character === "\n") {
        line = line + 1;
        column = 1;
      } else {
        column = column + 1;
      }
    }
    return character;
  }

  function considerSpace() {
    space = true;
  }

  function ignoreSpace() {
    space = false;
  }

  return { getNextToken, hasMoreTokens, considerSpace, ignoreSpace, peekToken, pointer: () => pointer, setPointer: (n: number) => (pointer = n), state };
}

export default Lexer;
