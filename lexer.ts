import { CloseParenthesis } from "./close.parenthesis.ts";
import { ExclamationMark } from "./exclamation.mark.ts";
import { Identifier } from "./identifier.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { QuestionMark } from "./question.mark.ts";
import { Token } from "./token.ts";

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

  public getNextToken(): Token {
    if (this.character() == "(") return new OpenParenthesis(this.character());
    if (this.character() == ")") return new CloseParenthesis(this.character());
    if (this.character() == "!") return new ExclamationMark(this.character());
    if (this.character() == "?") return new QuestionMark(this.character());

    if (/[a-zA-Z]/.test(this.character())) {
      return this.getIdentifier();
    }

    throw "Invalid character found in the program";
  }
}
