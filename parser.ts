import Lexer from "./lexer.ts";
import { ParserError } from "./parser.error.ts";
import { Value } from "./value.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export default class Parser extends Lexer {
  private errors = new Array<ParserError>();

  // help Program

  private assert<T>(instance: T, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T>(token: T, constructor: Constructor<T>, message: string) {
    if (this.assert(token, constructor)) return token;
    this.errors.push(new ParserError(message));
    return token;
  }

  // parse Program

  public parse() {
    if (this.hasMoreTokens()) return this.parseValue();
  }

  private parseValue() {
    return this.expect(this.getNextToken(), Value, "Token type of either identifier or number expected");
  }
}
