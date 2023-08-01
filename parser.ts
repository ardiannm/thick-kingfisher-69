import Lexer from "./lexer.ts";
import Value from "./value.ts";
import Plus from "./plus.ts";
import Binary from "./binary.ts";
import Operator from "./operator.ts";
import Expression from "./expression.ts";
import Minus from "./minus.ts";
import Multiplication from "./multiplication.ts";
import Division from "./division.ts";
import Power from "./power.ts";
import Unary from "./unary.ts";
import OpenParenthesis from "./open.parenthesis.ts";
import CloseParenthesis from "./close.parenthesis.ts";
import Parenthesis from "./parenthesis.ts";
import Quote from "./quote.ts";
import DoubleQuoteString from "./double.quote.string.ts";
import ParserError from "./parser.error.ts";
import Program from "./program.ts";
import IllegalCharacter from "./invalid.ts";
import WarningError from "./warning.error.ts";

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
    this.logError(new ParserError(message, this.position));
    return token as R;
  }

  // parse Program

  public parse() {
    const expressions = new Array<Expression>();
    while (this.hasMoreTokens()) {
      expressions.push(this.parseAddition());
    }
    return new Program(expressions);
  }

  private parseAddition() {
    let left = this.parseMultiplication();
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
      const right = this.expect(this.parsePower(), Expression, "Invalid right hand side expression in multiplication operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parsePower() {
    let left = this.parseUnary();
    if (this.peekToken() instanceof Power) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parsePower(), Expression, "Invalid right hand side expression in power operation");
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken() instanceof Plus || this.peekToken() instanceof Minus) {
      const operator = this.getNextToken() as Operator;
      const right = this.expect(this.parseUnary(), Expression, "Invalid right hand side expression in unary operation");
      return new Unary(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      const begin = this.getNextToken() as OpenParenthesis;
      const expression = this.expect(this.parseAddition(), Expression, "Parenthesis expression cannot be empty");
      const end = this.expect(this.getNextToken(), CloseParenthesis, "Missing a closing ')' in parenthesis expression");
      return new Parenthesis(begin, expression, end);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      const begin = this.getNextToken() as Quote;
      this.keepSpace();
      let raw = "";
      while (this.hasMoreTokens()) {
        if (this.peekToken() instanceof Quote) break;
        raw += this.nextCharacter();
      }
      this.ignoreSpace();
      const end = this.expect(this.getNextToken(), Quote, "Missing a closing quote '\"' in the end of string");
      return new DoubleQuoteString(begin, raw, end);
    }
    return this.parseValue();
  }

  private parseValue() {
    const token = this.expect(this.getNextToken(), Value, "Unexpected end of program");
    if (token instanceof IllegalCharacter) {
      this.logError(new WarningError(`Illegal chacater '${token.raw}' found while parsing`, this.position));
    }
    return token;
  }
}
