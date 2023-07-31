import Lexer from "./lexer.ts";

import { ParserError } from "./parser.error.ts";
import { Value } from "./value.ts";
import { Plus } from "./plus.ts";
import { Binary } from "./binary.ts";
import { Operator } from "./operator.ts";
import { Expression } from "./expression.ts";
import { Minus } from "./minus.ts";
import { Multiplication } from "./multiplication.ts";
import { Division } from "./division.ts";
import { Power } from "./power.ts";
import { Unary } from "./unary.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { CloseParenthesis } from "./close.parenthesis.ts";
import { Parenthesis } from "./parenthesis.ts";
import { Quote } from "./quote.ts";
import { DoubleQuoteString } from "./double.quote.string.ts";

// deno-lint-ignore no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export default class Parser extends Lexer {
  //

  // help Program

  private assert<T>(instance: T, constructor: Constructor<T>): boolean {
    return instance instanceof constructor;
  }

  private expect<T, R extends T>(token: T, constructor: Constructor<R>, message: string): R {
    if (this.assert(token, constructor)) return token as R;
    this.errors.push(new ParserError(message));
    return token as R;
  }

  // parse Program

  public parse() {
    return this.parseAddition();
  }

  private parseAddition() {
    let left = this.parseValue();
    while (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseMultiplication(), Expression, "Invalid right hand side expression in addition operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division) {
      const operator = this.getNextToken() as Operator;
      const right = this.parsePower();
      this.expect(right, Expression, "Invalid right hand side expression in multiplication operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parsePower(): Expression {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      const operator = this.getNextToken() as Operator;
      const right = this.parsePower();
      this.expect(right, Expression, "Invalid right hand side expression in power operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      const right = this.parseUnary();
      this.expect(right, Expression, "Invalid right hand side expression in unary operation");
      return new Unary(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const begin = this.getNextToken() as OpenParenthesis;
      const expression = this.parseAddition();
      const end = this.expect(this.getNextToken(), CloseParenthesis, "Missing a closing ')' in parenthesis expression");
      return new Parenthesis(begin, expression, end);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      const begin = this.getNextToken() as Quote;
      this.keepSpace();
      let string = "";
      while (this.hasMoreTokens()) {
        if (this.peekToken() instanceof Quote) break;
        string += this.nextCharacter();
      }
      this.ignoreSpace();
      const end = this.expect(this.getNextToken(), Quote, "Missing a closing quote '\"' in the end of string");
      return new DoubleQuoteString(begin, string, end);
    }
    return this.parseValue();
  }

  private parseValue(): Expression {
    return this.expect(this.getNextToken(), Value, "Token type of either identifier or number expected");
  }
}
