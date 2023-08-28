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
import IllegalCharacter from "./utils/IllegalCharacter";
import LexerState from "./utils/LexerState";
import RestoreState from "./utils/RestoreState";
import EOF from "./tokens/basic/EOF";
import OpenParenthesis from "./tokens/basic/OpenParenthesis";
import InjectId from "./utils/InjectId";
import Logger from "./utils/Logger";

export default class Lexer {
  private space = false;
  protected state = new LexerState(0, 1);
  protected logger = new Map<number, Logger>();

  constructor(protected input: string) {}

  @InjectId
  protected getNextToken(): Token {
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

    if (char == "+") return new Plus(next);
    if (char == "-") return new Minus(next);
    if (char == "*") return new Product(next);
    if (char == "/") return new Slash(next);
    if (char == "^") return new Power(next);

    if (char) {
      throw new IllegalCharacter("Illegal character '" + char + "' found while parsing");
    }

    return new EOF();
  }

  @RestoreState
  protected peekToken(): Token {
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
        this.state.location.line = this.state.location.line + 1;
        this.state.location.column = 1; // Reset the column for the new line
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
    return this.input.charAt(this.state.pointer);
  }

  protected getNext() {
    const character = this.peek();
    if (character) {
      this.state.pointer = this.state.pointer + 1;
      this.state.location.column = this.state.location.column + 1; // Increment the column
    }
    return character;
  }
}
