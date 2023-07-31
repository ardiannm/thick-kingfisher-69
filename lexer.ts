import { CloseParenthesis } from "./close.parenthesis.ts";
import { ExclamationMark } from "./exclamation.mark.ts";
import { Number } from "./number.ts";
import { Identifier } from "./identifier.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { QuestionMark } from "./question.mark.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Division } from "./division.ts";
import { Multiplication } from "./multiplication.ts";
import { EOF } from "./eof.ts";

export default class Lexer {
  constructor(public input: string) {}
  private pointer = 0;

  public hasMoreTokens(): boolean {
    return this.input.length - this.pointer > 0;
  }

  private character() {
    return this.input.charAt(this.pointer);
  }

  private next() {
    const character = this.character();
    this.pointer++;
    return character;
  }

  private getIdentifier() {
    let value = "";
    while (/[a-zA-Z]/.test(this.character())) value += this.next();
    return new Identifier(value);
  }

  private getNumber() {
    let value = "";
    while (/[0-9]/.test(this.character())) value += this.next();
    return new Number(value);
  }

  public peekToken() {
    const start = this.pointer;
    const token = this.getNextToken();
    this.pointer = start;
    return token;
  }

  public getNextToken() {
    //

    // special characters
    if (this.character() == "(") return new OpenParenthesis(this.next());
    if (this.character() == ")") return new CloseParenthesis(this.next());
    if (this.character() == "!") return new ExclamationMark(this.next());
    if (this.character() == "?") return new QuestionMark(this.next());

    // operators
    if (this.character() == "+") return new Plus(this.next());
    if (this.character() == "-") return new Minus(this.next());
    if (this.character() == "*") return new Multiplication(this.next());
    if (this.character() == "/") return new Division(this.next());

    // identifiers
    if (/[a-zA-Z]/.test(this.character())) {
      return this.getIdentifier();
    }

    // numbers
    if (/[0-9]/.test(this.character())) {
      return this.getNumber();
    }

    // invalid characters
    if (this.hasMoreTokens()) console.log(`Invalid character '${this.pointer}' found in the program`);

    // end of file
    return new EOF();
  }
}
