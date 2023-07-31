import Lexer from "./lexer.ts";

import { ParserError } from "./parser.error.ts";
import { Value } from "./value.ts";
import { Plus } from "./plus.ts";
import { Binary } from "./binary.ts";
import { Operator } from "./operator.ts";
import { Expression } from "./expression.ts";
import { Minus } from "./minus.ts";

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
    return this.parseAddition();
  }

  private parseAddition() {
    let left = this.parseValue();
    while (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseValue(), Expression, "Invalid right hand side expression in addition operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseValue(): Expression {
    return this.expect(this.getNextToken(), Value, "Token type of either identifier or number expected");
  }
}
