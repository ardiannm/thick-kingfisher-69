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

export default class Lexer {
  private space = false;
  private gen = 0;
  protected position = 0;
  constructor(protected input: string) {}

  public getNextToken(): Token {
    const char = this.peek();

    if (/[0-9]/.test(char)) return this.getNumber();
    if (/\s/.test(char)) return this.getSpace();
    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();

    const id = this.id();
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

    if (next) return new UnknownCharacter(id, next);

    return new EOF(id);
  }

  public hasMoreTokens(): boolean {
    return !(this.peekToken() instanceof EOF);
  }

  protected peekToken() {
    const startsAt = this.position;
    const id = this.gen;
    const token = this.getNextToken();
    this.position = startsAt;
    this.gen = id;
    return token;
  }

  protected keepSpace() {
    this.space = true;
  }

  protected ignoreSpace() {
    this.space = false;
  }

  private peek() {
    return this.input.charAt(this.position);
  }

  protected getNext() {
    const character = this.peek();
    this.position = this.position + 1;
    return character;
  }

  private getNumber() {
    let view = "";
    while (/[0-9]/.test(this.peek())) view += this.getNext();
    return new Number(this.id(), view);
  }

  private getSpace() {
    let view = "";
    while (/\s/.test(this.peek())) view += this.getNext();
    if (this.space) return new Space(this.id(), view);
    return this.getNextToken();
  }

  private getIdentifier() {
    let view = "";
    while (/[a-zA-Z]/.test(this.peek())) view += this.getNext();
    return new Identifier(this.id(), view);
  }

  protected id() {
    const id = this.gen + 1;
    this.gen = id;
    return id;
  }
}
