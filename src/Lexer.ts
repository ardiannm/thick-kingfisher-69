import Token from "./tokens/Token";
import OpenParenthesis from "./tokens/OpenParenthesis";
import CloseParenthesis from "./tokens/CloseParenthesis";
import Number from "./tokens/Number";
import Identifier from "./tokens/Identifier";
import Power from "./tokens/Power";
import ExclamationMark from "./tokens/ExclamationMark";
import Minus from "./tokens/Minus";
import Slash from "./tokens/Slash";
import QuestionMark from "./tokens/QuestionMark";
import Quote from "./tokens/Quote";
import LessThan from "./tokens/LessThan";
import Plus from "./tokens/Plus";
import GreaterThan from "./tokens/GreaterThan";
import Equals from "./tokens/Equals";
import Product from "./tokens/Product";
import Space from "./tokens/Space";
import Newline from "./tokens/Newline";
import SemiColon from "./tokens/SemiColon";
import ParseError from "./tokens/ParseError";
import TokenError from "./tokens/TokenError";
import StateMachine from "./tokens/StateMachine";
import Preserve from "./tokens/Preserve";
import EOF from "./tokens/EOF";
import Register from "./tokens/Register";

export default class Lexer {
  private space = false;
  private state = new StateMachine(0, 1, 0, 1);

  constructor(protected input: string) {}

  protected getNextToken(): Token {
    const char = this.peek();

    if (/\r|\n/.test(char)) return this.getNewLine();
    if (/\s/.test(char)) return this.getSpace();
    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();
    if (/[0-9]/.test(char)) return this.getNumber();

    const next = this.getNext();

    if (char == ";") return new SemiColon(next);
    if (char == "(") return new OpenParenthesis(next);
    if (char == ")") return new CloseParenthesis(next);
    if (char == "!") return new ExclamationMark(next);
    if (char == "?") return new QuestionMark(next);
    if (char == '"') return new Quote(next);
    if (char == "<") return new LessThan(next);
    if (char == ">") return new GreaterThan(next);
    if (char == "=") return new Equals(next);

    if (char == "+") return new Plus(next);
    if (char == "-") return new Minus(next);
    if (char == "*") return new Product(next);
    if (char == "/") return new Slash(next);
    if (char == "^") return new Power(next);

    if (char) {
      const error = new TokenError(`Unknown character '${char}' found while parsing`);
      this.report(error);
      throw error;
    }

    return new EOF();
  }

  @Register(Token)
  public parseToken() {
    return this.getNextToken();
  }

  @Preserve
  protected peekToken(): Token {
    return this.getNextToken();
  }

  private getNumber() {
    let view = "";
    while (/[0-9]/.test(this.peek())) view += this.getNext();
    return new Number(view);
  }

  private getNewLine() {
    let view = "";
    while (/\r/.test(this.peek())) view += this.getNext();
    view += this.getNext();
    this.newLine();
    return new Newline(view);
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
    return this.input.charAt(this.state.pointer);
  }

  protected getNext() {
    const character = this.peek();
    this.state.pointer = this.state.pointer + 1;
    return character;
  }

  private newLine() {
    this.state.line = this.state.line + 1;
    this.state.lineStart = this.state.pointer;
  }

  protected report(error: ParseError) {
    const msg = `${error.name}: ${error.message}.`;
    console.log(msg);
  }
}
