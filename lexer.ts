import { CloseParenthesis } from "./close.parenthesis.ts";
import { ExclamationMark } from "./exclamation.mark.ts";
import { Number } from "./number.ts";
import { Identifier } from "./identifier.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { QuestionMark } from "./question.mark.ts";
import { Token } from "./token.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Division } from "./division.ts";
import { Multiplication } from "./multiplication.ts";

export class Lexer {
  private pointer = 0;
  constructor(public input: string) {}

  private hasMoreTokens(): boolean {
    return this.input.length - this.pointer > 0;
  }

  private character() {
    return this.input.charAt(this.pointer);
  }

  private nextCharacter() {
    const character = this.character();
    this.pointer++;
    return character;
  }

  private getIdentifier() {
    let value = "";
    while (/[a-zA-Z]/.test(this.character())) value += this.nextCharacter();
    return new Identifier(value);
  }

  private getNumber() {
    let value = "";
    while (/[0-9]/.test(this.character())) value += this.nextCharacter();
    return new Number(value);
  }

  public getNextToken(): Token {
    // special characters

    if (this.character() == "(") return new OpenParenthesis(this.character());
    if (this.character() == ")") return new CloseParenthesis(this.character());
    if (this.character() == "!") return new ExclamationMark(this.character());
    if (this.character() == "?") return new QuestionMark(this.character());

    // operators

    if (this.character() == "+") return new Plus(this.character());
    if (this.character() == "-") return new Minus(this.character());
    if (this.character() == "*") return new Multiplication(this.character());
    if (this.character() == "/") return new Division(this.character());

    // identifiers

    if (/[a-zA-Z]/.test(this.character())) {
      return this.getIdentifier();
    }

    // numbers

    if (/[0-9]/.test(this.character())) {
      return this.getNumber();
    }

    console.log("Invalid character found in the program");
    Deno.exit(0);
  }
}
