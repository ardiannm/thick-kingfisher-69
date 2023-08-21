import Token from "./token";
import State from "./state";
import OpenParenthesis from "./open.parenthesis";
import ClosingParenthesis from "./closing.parenthesis";
import Number from "./number";
import Identifier from "./identifier";
import UnknownCharacter from "./unknown.character";
import Exponentiation from "./exponentiation";
import ExclamationMark from "./exclamation.mark";
import Substraction from "./substraction";
import Division from "./division";
import QuestionMark from "./question.mark";
import Quote from "./quote";
import LessThan from "./less.than";
import Addition from "./addition";
import GreaterThan from "./greater.than";
import Equals from "./equals";
import Multiplication from "./multiplication";
import Space from "./space";
import Newline from "./newline";
import EOF from "./eof";

export default class Lexer {
  protected pointer = 0;
  private generation = 0;
  protected line = 1;
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

    if (char) return new UnknownCharacter(id, next);

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
}
