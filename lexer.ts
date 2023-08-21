import ExclamationMark from "./exclamation.mark.ts";
import Number from "./number.ts";
import Identifier from "./identifier.ts";
import OpenParenthesis from "./open.parenthesis.ts";
import QuestionMark from "./question.mark.ts";
import Division from "./division.ts";
import Multiplication from "./multiplication.ts";
import Space from "./space.ts";
import Token from "./token.ts";
import Quote from "./quote.ts";
import LessThan from "./less.than.ts";
import GreaterThan from "./greater.than.ts";
import UnknownCharacter from "./unknown.character.ts";
import Exponentiation from "./exponentiation.ts";
import Addition from "./addition.ts";
import Substraction from "./substraction.ts";
import ClosingParenthesis from "./closing.parenthesis.ts";
import Equals from "./equals.ts";
import EOF from "./eof.ts";
import Info from "./info.ts";
import Newline from "./newline.ts";

export default class Lexer {
  protected pointer = 0;
  private generation = 0;
  protected line = 1;
  private space = false;
  public info = new Map<number, Info>();
  constructor(protected input: string) {}

  public getNextToken(): Token {
    const char = this.peek();

    const info = this.snapshot();
    const id = this.generateInfo(info);

    if (/\r|\n/.test(char)) return this.getNewline();
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
    const info = this.snapshot();
    const token = this.getNextToken();
    this.pointer = info.pointer;
    this.generation = info.id;
    if (this.line > info.line) this.line = info.line;
    return token;
  }

  private getNumber() {
    let view = "";
    const info = this.snapshot();
    while (/[0-9]/.test(this.peek())) view += this.getNext();
    const id = this.generateInfo(info);
    return new Number(id, view);
  }

  private getNewline() {
    let view = "";
    this.newLine();
    const info = this.snapshot();
    if (this.peek() == "\r") {
      view += this.getNext();
      view += this.getNext();
    } else {
      view += this.getNext();
    }
    const id = this.generateInfo(info);
    return new Newline(id, view);
  }

  private getSpace() {
    let view = "";
    const info = this.snapshot();
    while (/\s/.test(this.peek())) view += this.getNext();
    const id = this.generateInfo(info);
    if (this.space) return new Space(id, view);
    return this.getNextToken();
  }

  private getIdentifier() {
    let view = "";
    const info = this.snapshot();
    while (/[a-zA-Z]/.test(this.peek())) view += this.getNext();
    const id = this.generateInfo(info);
    return new Identifier(id, view);
  }

  protected generateInfo(info: { id: number; pointer: number; line: number }) {
    const id = this.generation + 1;
    this.generation = id;
    this.info.set(id, new Info(info.pointer, this.pointer, info.line));
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

  protected snapshot() {
    return { id: this.generation, pointer: this.pointer, line: this.line };
  }
}
