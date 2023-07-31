import CloseParenthesis from "./close.parenthesis.ts";
import ExclamationMark from "./exclamation.mark.ts";
import Number from "./number.ts";
import Identifier from "./identifier.ts";
import OpenParenthesis from "./open.parenthesis.ts";
import QuestionMark from "./question.mark.ts";
import Plus from "./plus.ts";
import Minus from "./minus.ts";
import Division from "./division.ts";
import Multiplication from "./multiplication.ts";
import Space from "./space.ts";
import Token from "./token.ts";
import Quote from "./quote.ts";
import Invalid from "./invalid.ts";
import EOF from "./eof.ts";
import LogError from "./log.error.ts";
import WarningError from "./warning.error.ts";

export default class Lexer {
  public errors = new Array<LogError>();
  public position = 0;
  private space = false;

  constructor(public input: string) {}

  public hasMoreTokens(): boolean {
    return this.input.length - this.position > 0;
  }

  private character() {
    return this.input.charAt(this.position);
  }

  public nextCharacter() {
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
    let raw = "";
    while (/[a-zA-Z]/.test(this.character())) raw += this.nextCharacter();
    return new Identifier(raw);
  }

  private getNumber() {
    let raw = "";
    while (/[0-9]/.test(this.character())) raw += this.nextCharacter();
    return new Number(raw);
  }

  public peekToken() {
    const start = this.position;
    const token = this.getNextToken();
    this.position = start;
    return token;
  }

  public logError(error: LogError) {
    this.errors.push(error);
  }

  public getNextToken(): Token {
    //

    const char = this.character();

    // identifiers
    if (/[a-zA-Z]/.test(char)) {
      return this.getIdentifier();
    }

    // numbers
    if (/[0-9]/.test(char)) {
      return this.getNumber();
    }

    // space
    if (/\s/.test(char)) {
      let raw = "";
      while (/\s/.test(this.character())) raw += this.nextCharacter();
      if (this.space) return new Space(raw);
      return this.getNextToken();
    }

    const next = this.nextCharacter();

    // special characters
    if (char == "(") return new OpenParenthesis(next);
    if (char == ")") return new CloseParenthesis(next);
    if (char == "!") return new ExclamationMark(next);
    if (char == "?") return new QuestionMark(next);
    if (char == '"') return new Quote(next);

    // operators
    if (char == "+") return new Plus(next);
    if (char == "-") return new Minus(next);
    if (char == "*") return new Multiplication(next);
    if (char == "/") return new Division(next);

    // invalid characters
    if (this.hasMoreTokens()) {
      this.logError(new WarningError(`Invalid character ${next} found in the program`, this.position));
      return new Invalid();
    }

    // end of file
    return new EOF();
  }
}
