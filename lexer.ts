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
import WarningError from "./warning.error.ts";
import ParserError from "./parser.error.ts";
import TokenInfo from "./token.info.ts";
import ClosingParenthesis from "./closing.parenthesis.ts";

export default class Lexer {
  public logger = { errors: new Array<LogError>(), warnings: new Array<WarningError>() };
  public position = 0;
  private space = false;

  constructor(public input: string) {}

  public hasMoreTokens(): boolean {
    return !(this.peekToken() instanceof EOF);
  }

  private getChar() {
    return this.input.charAt(this.position);
  }

  public getNextChar() {
    const character = this.getChar();
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
    while (/[a-zA-Z]/.test(this.getChar())) raw += this.getNextChar();
    return new Identifier(raw, new TokenInfo(startsAt, this.position));
  }

  private getNumber() {
    const startsAt = this.position;
    let raw = "";
    while (/[0-9]/.test(this.getChar())) raw += this.getNextChar();
    return new Number(raw, new TokenInfo(startsAt, this.position));
  }

  private getSpace() {
    const startsAt = this.position;
    let raw = "";
    while (/\s/.test(this.getChar())) raw += this.getNextChar();
    if (this.space) return new Space(raw, new TokenInfo(startsAt, this.position));
    return this.getNextToken();
  }

  public peekToken() {
    const startsAt = this.position;
    const token = this.getNextToken();
    this.position = startsAt;
    return token;
  }

  public logError(error: LogError) {
    switch (true) {
      case error instanceof WarningError: {
        this.logger.warnings.push(error);
        break;
      }
      case error instanceof ParserError: {
        this.logger.errors.push(error);
        break;
      }
    }
    return error;
  }

  public snapBack(token: Token) {
    this.position = token.info.startsAt;
  }

  public getNextToken(): Token {
    const startsAt = this.position;
    const char = this.getChar();

    if (/[0-9]/.test(char)) return this.getNumber();
    if (/\s/.test(char)) return this.getSpace();
    if (/[a-zA-Z]/.test(char)) return this.getIdentifier();

    const next = this.getNextChar();

    if (char == "(") return new OpenParenthesis(next, new TokenInfo(startsAt, this.position));
    if (char == ")") return new ClosingParenthesis(next, new TokenInfo(startsAt, this.position));
    if (char == "!") return new ExclamationMark(next, new TokenInfo(startsAt, this.position));
    if (char == "?") return new QuestionMark(next, new TokenInfo(startsAt, this.position));
    if (char == '"') return new Quote(next, new TokenInfo(startsAt, this.position));
    if (char == "<") return new LessThan(next, new TokenInfo(startsAt, this.position));
    if (char == ">") return new GreaterThan(next, new TokenInfo(startsAt, this.position));

    if (char == "+") return new Addition(next, new TokenInfo(startsAt, this.position));
    if (char == "-") return new Substraction(next, new TokenInfo(startsAt, this.position));
    if (char == "*") return new Multiplication(next, new TokenInfo(startsAt, this.position));
    if (char == "/") return new Division(next, new TokenInfo(startsAt, this.position));
    if (char == "^") return new Exponentiation(next, new TokenInfo(startsAt, this.position));

    if (next) return new UnknownCharacter(next, new TokenInfo(startsAt, this.position));

    return new EOF(new TokenInfo(startsAt, this.position));
  }
}
