import CloseParenthesis from "./close.parenthesis.ts";
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

export default class Lexer {
  public logger = { errors: new Array<LogError>(), warnings: new Array<WarningError>() };
  public position = 0;
  private space = false;

  constructor(public input: string) {}

  public hasMoreTokens(): boolean {
    return !(this.peekToken() instanceof EOF);
  }

  private character() {
    return this.input.charAt(this.position);
  }

  public getNextChar() {
    const character = this.character();
    this.position++;
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
    let string = "";
    while (/[a-zA-Z]/.test(this.character())) string += this.getNextChar();
    return new Identifier(string, new TokenInfo(startsAt, this.position));
  }

  private getNumber() {
    const startsAt = this.position;
    let string = "";
    while (/[0-9]/.test(this.character())) string += this.getNextChar();
    return new Number(string, new TokenInfo(startsAt, this.position));
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

  public getNextToken(): Token {
    const startsAt = this.position;
    const char = this.character();

    if (/[a-zA-Z]/.test(char)) {
      return this.getIdentifier();
    }

    if (/[0-9]/.test(char)) {
      return this.getNumber();
    }

    if (/\s/.test(char)) {
      let string = "";
      while (/\s/.test(this.character())) string += this.getNextChar();
      if (this.space) return new Space(string, new TokenInfo(startsAt, this.position));
      return this.getNextToken();
    }

    const next = this.getNextChar();

    if (char == "(") return new OpenParenthesis(next, new TokenInfo(startsAt, this.position));
    if (char == ")") return new CloseParenthesis(next, new TokenInfo(startsAt, this.position));
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
