import Token from "./tokens/basic/Token";
import CloseParenthesis from "./tokens/basic/CloseParenthesis";
import Number from "./tokens/expressions/Number";
import Identifier from "./tokens/expressions/Identifier";
import Power from "./tokens/operators/Power";
import ExclamationMark from "./tokens/basic/ExclamationMark";
import Minus from "./tokens/operators/Minus";
import Slash from "./tokens/operators/Slash";
import QuestionMark from "./tokens/basic/QuestionMark";
import Quote from "./tokens/basic/Quote";
import LessThan from "./tokens/basic/LessThan";
import Plus from "./tokens/operators/Plus";
import Comma from "./tokens/basic/Comma";
import Underline from "./tokens/basic/Underline";
import GreaterThan from "./tokens/basic/GreaterThan";
import Equals from "./tokens/basic/Equals";
import Product from "./tokens/operators/Product";
import Space from "./tokens/basic/Space";
import SemiColon from "./tokens/basic/SemiColon";
import Colon from "./tokens/basic/Colon";
import UnknownCharacter from "./utils/UnknownCharacter";
import EOF from "./tokens/basic/EOF";
import OpenParenthesis from "./tokens/basic/OpenParenthesis";
import BackSlash from "./tokens/basic/BackSlash";
import Locator from "./utils/Locator";
import InjectId from "./utils/InjectId";

export default class Lexer {
  private space = false;
  protected pointer = 0;
  protected line = 1;
  protected column = 1;
  protected id = 1;
  protected locators = new Map<number, Locator>();

  constructor(protected input: string) {}

  private getNextToken(): Token {
    const char = this.peek();

    if (/\s/.test(char)) return this.getSpace();
    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();
    if (/[0-9]/.test(char)) return this.getNumber();

    const next = this.getNext();

    if (char == ",") return new Comma(next);
    if (char == ";") return new SemiColon(next);
    if (char == ":") return new Colon(next);
    if (char == "(") return new OpenParenthesis(next);
    if (char == ")") return new CloseParenthesis(next);
    if (char == "!") return new ExclamationMark(next);
    if (char == "?") return new QuestionMark(next);
    if (char == '"') return new Quote(next);
    if (char == "<") return new LessThan(next);
    if (char == ">") return new GreaterThan(next);
    if (char == "=") return new Equals(next);
    if (char == "_") return new Underline(next);
    if (char == "\\") return new BackSlash(next);

    if (char == "+") return new Plus(next);
    if (char == "-") return new Minus(next);
    if (char == "*") return new Product(next);
    if (char == "/") return new Slash(next);
    if (char == "^") return new Power(next);

    if (char) {
      const token = new UnknownCharacter(next);
      new Locator(this.line, this.column, this.line, this.column).printf(this.input, `unknown character \`${next}\` found in the lexer`);
      return token;
    }

    return new EOF();
  }

  protected peekToken(): Token {
    const pointer = this.pointer;
    const line = this.line;
    const column = this.column;
    const id = this.id;
    const token = this.getNextToken();
    this.pointer = pointer;
    this.line = line;
    this.column = column;
    this.id = id;
    return token;
  }

  @InjectId
  protected parseToken() {
    return this.getNextToken();
  }

  private getNumber() {
    let view = "";
    while (/[0-9]/.test(this.peek())) view += this.getNext();
    return new Number(view);
  }

  private getSpace() {
    let view = "";
    while (/\s/.test(this.peek())) {
      if (this.peek() === "\n") {
        this.line = this.line + 1;
        this.column = 1;
      }
      view += this.getNext();
    }
    if (this.space) return new Space(view);
    return this.getNextToken();
  }

  private getIdentifier() {
    let view = "";
    while (/[a-zA-Z]/.test(this.peek())) view += this.getNext();
    return new Identifier(view);
  }

  public hasMoreTokens(): boolean {
    return !(this.peekToken() instanceof EOF);
  }

  protected keepSpace() {
    this.space = true;
  }

  protected ignoreSpace() {
    this.space = false;
  }

  private peek() {
    return this.input.charAt(this.pointer);
  }

  protected getNext() {
    const character = this.peek();
    if (character) {
      this.pointer = this.pointer + 1;
      if (character !== "\r" && character !== "\n") {
        this.column = this.column + 1;
      }
    }
    return character;
  }
}
