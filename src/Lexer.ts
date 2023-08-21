import Token from "./Token";
import State from "./State";
import OpenParenthesis from "./OpenParenthesis";
import ClosingParenthesis from "./ClosingParenthesis";
import Number from "./Number";
import Identifier from "./Identifier";
import UnknownCharacter from "./UnknownCharacter";
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
import EOF from "./EOF";
import SemiColon from "./SemiColon";
import TokenError from "./TokenError";
import ParserError from "./ParserError";

export default class Lexer {
  protected pointer = 0;
  private generation = 0;
  protected line = 1;
  protected lineStart = 0;
  private space = false;
  public data = new Map<number, State>();
  constructor(protected input: string) {}

  public getNextToken(): Token {
    const char = this.peek();

    const data = this.keepState();
    const id = this.generate(data);

    if (/\r|\n/.test(char)) return this.getNewLine();
    if (/\s/.test(char)) return this.getSpace();
    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();
    if (/[0-9]/.test(char)) return this.getNumber();

    const next = this.getNext();

    if (char == ";") return new SemiColon(id, next);
    if (char == "(") return new OpenParenthesis(id, next);
    if (char == ")") return new ClosingParenthesis(id, next);
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
      const error = new TokenError(`Unknown character '${char}' found while parsing`, new UnknownCharacter(id, next));
      this.report(error);
      throw error;
    }

    return new EOF(id);
  }

  protected peekToken() {
    const data = this.keepState();
    const token = this.getNextToken();
    this.pointer = data.pointer;
    this.generation = data.id;
    if (this.line > data.line) this.line = data.line;
    return token;
  }

  private getNumber() {
    let view = "";
    const data = this.keepState();
    while (/[0-9]/.test(this.peek())) view += this.getNext();
    const id = this.generate(data);
    return new Number(id, view);
  }

  private getNewLine() {
    let view = "";
    const data = this.keepState();
    while (/\r/.test(this.peek())) view += this.getNext();
    view += this.getNext();
    this.newLine();
    const id = this.generate(data);
    return new Newline(id, view);
  }

  private getSpace() {
    let view = "";
    const data = this.keepState();
    while (/\s/.test(this.peek())) view += this.getNext();
    const id = this.generate(data);
    if (this.space) return new Space(id, view);
    return this.getNextToken();
  }

  private getIdentifier() {
    let view = "";
    const data = this.keepState();
    while (/[a-zA-Z]/.test(this.peek())) view += this.getNext();
    const id = this.generate(data);
    return new Identifier(id, view);
  }

  protected generate(data: { id: number; pointer: number; line: number }) {
    const id = this.generation + 1;
    this.generation = id;
    this.data.set(id, new State(data.pointer, this.pointer, data.line));
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
    return this.input.charAt(this.pointer);
  }

  protected getNext() {
    const character = this.peek();
    this.pointer = this.pointer + 1;
    return character;
  }

  private newLine() {
    this.line = this.line + 1;
  }

  protected keepState() {
    return { id: this.generation, pointer: this.pointer, line: this.line };
  }

  protected report(error: ParserError) {
    console.log(`${error.message} at token [${error.position.id}]`);
  }
}
