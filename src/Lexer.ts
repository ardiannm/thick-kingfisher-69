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

export default class Lexer {
  protected pointer = 0;
  protected id = 1;
  protected line = 1;
  protected column = 1;

  private space = false;

  constructor(protected input: string) {}

  protected peekToken(): SyntaxToken {
    const pointer = this.pointer;
    const id = this.id;
    const line = this.line;
    const column = this.column;
    const token = this.getNextToken();
    this.pointer = pointer;
    this.id = id;
    this.line = line;
    this.column = column;
    return token;
  }

  public hasMoreTokens(): boolean {
    return !(this.peekToken() instanceof EOF);
  }

  protected getNextToken(): SyntaxToken {
    const char = this.peek();

    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();
    if (/[0-9]/.test(char)) return this.getNumber();
    if (/\s/.test(char)) return this.getSpace();

    const next = this.getNext();

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

  private getNumber() {
    let view = "";
    while (/[0-9]/.test(this.peek())) view += this.getNext();
    return new Number(view);
  }

  private getSpace() {
    let view = "";
    while (/\s/.test(this.peek())) view += this.getNext();
    if (this.space) return new Space(view);
    return this.getNextToken();
  }

  private getIdentifier() {
    let view = "";
    while (/[a-zA-Z]/.test(this.peek())) view += this.getNext();
    return new Identifier(view);
  }

  private peek() {
    return this.input.charAt(this.pointer);
  }

  protected getNext() {
    const character = this.peek();
    if (character) {
      this.pointer = this.pointer + 1;
      if (character === "\n") {
        this.line = this.line + 1;
        this.column = 1;
      } else {
        this.column = this.column + 1;
      }
    }
    return character;
  }

  protected considerSpace() {
    this.space = true;
  }

  protected ignoreSpace() {
    this.space = false;
  }
}
