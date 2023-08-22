import Token from "./Token";
import Info from "./Info";
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
  protected pos = 0;
  private generation = 0;
  protected line = 1;
  protected lineStart = 0;
  private space = false;
  public data = new Map<number, Info>();
  constructor(protected input: string) {}

  protected reset() {
    this.pos = 0;
    this.generation = 0;
    this.line = 1;
    this.lineStart = 0;
    this.space = false;
    this.data = new Map<number, Info>();
  }

  public getNextToken(): Token {
    const char = this.peek();

    const data = this.keepInfo();
    const id = this.generate(data);

    if (/\r|\n/.test(char)) return this.getNewLine();
    if (/\s/.test(char)) return this.getSpace();
    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();
    if (/[0-9]/.test(char)) return this.getNumber();

    const next = this.getNext();

    if (char == ";") return new SemiColon(id, next);
    if (char == "(") return new OpenParenthesis(id, next);
    if (char == ")") return new CloseParenthesis(id, next);
    if (char == "!") return new ExclamationMark(id, next);
    if (char == "?") return new QuestionMark(id, next);
    if (char == '"') return new Quote(id, next);
    if (char == "<") return new LessThan(id, next);
    if (char == ">") return new GreaterThan(id, next);
    if (char == "=") return new Equals(id, next);

    if (char == "+") return new Addition(id, next);
    if (char == "-") return new Substraction(id, next);
    if (char == "*") return new Multiplication(id, next);
    if (char == "/") return new Division(id, next);
    if (char == "^") return new Exponentiation(id, next);

    if (char) {
      const error = new TokenError(id, `Unknown character '${char}' found while parsing`);
      this.report(error);
      throw error;
    }

    return new EOF(id);
  }

  protected peekToken() {
    const token = this.getNextToken();
    const info = this.data.get(token.id);
    this.pos = info.start;
    this.generation = info.id;
    if (this.line > info.line) this.line = info.line;
    if (this.lineStart > info.lineStart) this.lineStart = info.lineStart;
    return token;
  }

  private getNumber() {
    let view = "";
    const data = this.keepInfo();
    while (/[0-9]/.test(this.peek())) view += this.getNext();
    const id = this.generate(data);
    return new Number(id, view);
  }

  private getNewLine() {
    let view = "";
    const data = this.keepInfo();
    while (/\r/.test(this.peek())) view += this.getNext();
    view += this.getNext();
    this.newLine();
    const id = this.generate(data);
    return new Newline(id, view);
  }

  private getSpace() {
    let view = "";
    const data = this.keepInfo();
    while (/\s/.test(this.peek())) view += this.getNext();
    const id = this.generate(data);
    if (this.space) return new Space(id, view);
    return this.getNextToken();
  }

  private getIdentifier() {
    let view = "";
    const data = this.keepInfo();
    while (/[a-zA-Z]/.test(this.peek())) view += this.getNext();
    const id = this.generate(data);
    return new Identifier(id, view);
  }

  protected generate(data: Info) {
    const id = this.generation + 1;
    this.generation = id;
    this.data.set(id, new Info(id, data.start, this.pos, data.line, this.lineStart));
    return id;
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
    return this.input.charAt(this.pos);
  }

  protected getNext() {
    const character = this.peek();
    this.pos = this.pos + 1;
    return character;
  }

  private newLine() {
    this.line = this.line + 1;
    this.lineStart = this.pos;
  }

  protected keepInfo() {
    return new Info(this.generation, this.pos, this.pos, this.line, this.lineStart);
  }

  protected report(error: ParseError) {
    const token = this.data.get(error.id);
    const row = token.line;
    const column = token.start - token.lineStart;
    const msg = `${error.name}: ${error.message}. ${"./src/tsts/tst.txt"}:${row}:${column}.`;

    const first = this.input.substring(token.lineStart, token.start);
    const second = this.input.substring(token.start);

    let pointer = `${first}${second}`.split("\n")[0];
    pointer += "\n" + first.replace(/./g, " ") + "^";

    console.log(msg);
    console.log();
    console.log(pointer);
  }
}
