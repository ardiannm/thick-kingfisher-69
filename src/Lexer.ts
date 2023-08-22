import Token from "./Token";
import TokenState from "./TokenState";
import OpenParenthesis from "./OpenParenthesis";
import CloseParenthesis from "./CloseParenthesis";
import Number from "./Number";
import Identifier from "./Identifier";
import Exponentiation from "./Exponentiation";
import ExclamationMark from "./ExclamationMark";
import Substraction from "./Substraction";
import Division from "./Division";
import QuestionMark from "./QuestionMark";
import Quote from "./Quote";
import LessThan from "./LessThan";
import Addition from "./Addition";
import GreaterThan from "./GreaterThan";
import Equals from "./Equals";
import Multiplication from "./Multiplication";
import Space from "./Space";
import Newline from "./Newline";
import SemiColon from "./SemiColon";
import ParseError from "./ParseError";
import TokenError from "./TokenError";

import EOF from "./EOF";

export default class Lexer {
  protected pointer = 0;
  private gen = 1;
  protected line = 1;
  protected lineStart = 0;
  private space = false;
  public state = new Map<number, TokenState>();
  constructor(protected input: string) {}

  public getNextToken(): Token {
    const char = this.peek();

    const state = this.getState();
    const gen = this.setState(state);

    if (/\r|\n/.test(char)) return this.getNewLine();
    if (/\s/.test(char)) return this.getSpace();
    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();
    if (/[0-9]/.test(char)) return this.getNumber();

    const next = this.getNext();

    if (char == ";") return new SemiColon(gen, next);
    if (char == "(") return new OpenParenthesis(gen, next);
    if (char == ")") return new CloseParenthesis(gen, next);
    if (char == "!") return new ExclamationMark(gen, next);
    if (char == "?") return new QuestionMark(gen, next);
    if (char == '"') return new Quote(gen, next);
    if (char == "<") return new LessThan(gen, next);
    if (char == ">") return new GreaterThan(gen, next);
    if (char == "=") return new Equals(gen, next);

    if (char == "+") return new Addition(gen, next);
    if (char == "-") return new Substraction(gen, next);
    if (char == "*") return new Multiplication(gen, next);
    if (char == "/") return new Division(gen, next);
    if (char == "^") return new Exponentiation(gen, next);

    if (char) {
      const error = new TokenError(gen, `Unknown character '${char}' found while parsing`);
      this.report(error);
      throw error;
    }

    return new EOF(gen);
  }

  protected peekToken() {
    const pointer = this.pointer;
    const line = this.line;
    const lineStart = this.lineStart;
    const gen = this.gen;
    const token = this.getNextToken();
    this.pointer = pointer;
    this.gen = gen;
    this.line = line;
    this.lineStart = lineStart;
    return token;
  }

  private getNumber() {
    let view = "";
    const state = this.getState();
    while (/[0-9]/.test(this.peek())) view += this.getNext();
    const id = this.setState(state);
    return new Number(id, view);
  }

  private getNewLine() {
    let view = "";
    const state = this.getState();
    while (/\r/.test(this.peek())) view += this.getNext();
    view += this.getNext();
    this.newLine();
    const gen = this.setState(state);
    return new Newline(gen, view);
  }

  private getSpace() {
    let view = "";
    const state = this.getState();
    while (/\s/.test(this.peek())) view += this.getNext();
    const gen = this.setState(state);
    if (this.space) return new Space(gen, view);
    return this.getNextToken();
  }

  private getIdentifier() {
    let view = "";
    const state = this.getState();
    while (/[a-zA-Z]/.test(this.peek())) view += this.getNext();
    const gen = this.setState(state);
    return new Identifier(gen, view);
  }

  protected setState(state: TokenState) {
    const gen = this.gen + 1;
    this.gen = gen;
    this.state.set(gen, new TokenState(gen, state.start, this.pointer, state.line, state.lineStart));
    return gen;
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
    this.pointer = this.pointer + 1;
    return character;
  }

  private newLine() {
    this.line = this.line + 1;
    this.lineStart = this.pointer;
  }

  protected getState() {
    return new TokenState(this.gen, this.pointer, this.pointer, this.line, this.lineStart);
  }

  protected report(error: ParseError) {
    const token = this.state.get(error.gen);
    const row = token.line;
    const column = token.start - token.lineStart + 1;
    const msg = `${error.name}: ${error.message}. ${"./src/tst/tst.txt"}:${row}:${column}.`;

    const first = this.input.substring(token.lineStart, token.start);
    const second = this.input.substring(token.start);

    let pointer = `${first}${second}`.split("\n")[0];
    pointer += "\n" + first.replace(/./g, " ") + "^";

    console.log(msg);
    console.log();
    console.log(pointer);
  }
}
