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
import LogError from "./log.error.ts";
import LessThan from "./less.than.ts";
import GreaterThan from "./greater.than.ts";
import UnknownCharacter from "./unknown.character.ts";
import Exponentiation from "./exponentiation.ts";
import Addition from "./addition.ts";
import Substraction from "./substraction.ts";
import EOF from "./eof.ts";
import TokenInfo from "./token.info.ts";
import ClosingParenthesis from "./closing.parenthesis.ts";
import Equals from "./equals.ts";

export default class Lexer {
  public logger = new Array<LogError>();
  public position = 0;
  private space = false;

  constructor(public input: string) {}

  public hasMoreTokens(): boolean {
    return !(this.peekToken() instanceof EOF);
  }

  private getCharacter() {
    return this.input.charAt(this.position);
  }

  public getNextCharacter() {
    const character = this.getCharacter();
    this.position = this.position + 1;
    return character;
  }

  public keepSpace() {
    this.space = true;
  }

  public ignoreSpace() {
    this.space = false;
  }

  private getIdentifier() {
    const startsAt = this.position;
    let raw = "";
    while (/[a-zA-Z]/.test(this.getCharacter())) raw += this.getNextCharacter();
    return new Identifier(raw, new TokenInfo(startsAt, this.position));
  }

  private getNumber() {
    const startsAt = this.position;
    let raw = "";
    while (/[0-9]/.test(this.getCharacter())) raw += this.getNextCharacter();
    return new Number(raw, new TokenInfo(startsAt, this.position));
  }

  private getSpace() {
    const startsAt = this.position;
    let raw = "";
    while (/\s/.test(this.getCharacter())) raw += this.getNextCharacter();
    if (this.space) return new Space(raw, new TokenInfo(startsAt, this.position));
    return this.getNextToken();
  }

  public peekToken() {
    const startsAt = this.position;
    const token = this.getNextToken();
    this.position = startsAt;
    return token;
  }

  public logError(error: LogError, atToken: Token) {
    error.token = atToken;
    this.logger.push(error);
    return error;
  }

  public peekBack(token: Token) {
    this.position = token.info.from;
  }

  public getNextToken(): Token {
    const char = this.getCharacter();

    if (/[0-9]/.test(char)) return this.getNumber();
    if (/\s/.test(char)) return this.getSpace();
    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();

    const from = this.position;
    const next = this.getNextCharacter();
    const to = this.position;
    const info = new TokenInfo(from, to);

    if (char == "(") return new OpenParenthesis(next, info);
    if (char == ")") return new ClosingParenthesis(next, info);
    if (char == "!") return new ExclamationMark(next, info);
    if (char == "?") return new QuestionMark(next, info);
    if (char == '"') return new Quote(next, info);
    if (char == "<") return new LessThan(next, info);
    if (char == ">") return new GreaterThan(next, info);
    if (char == "=") return new Equals(next, info);

    if (char == "+") return new Addition(next, info);
    if (char == "-") return new Substraction(next, info);
    if (char == "*") return new Multiplication(next, info);
    if (char == "/") return new Division(next, info);
    if (char == "^") return new Exponentiation(next, info);

    if (next) return new UnknownCharacter(next, info);

    return new EOF(new TokenInfo(from, from));
  }
}
