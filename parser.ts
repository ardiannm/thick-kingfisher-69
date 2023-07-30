import { Tokenizer } from "./tokenizer.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Multiplication } from "./multiplication.ts";
import { Division } from "./division.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { Quote } from "./quote.ts";
import { DoubleQuoteString } from "./double.quote.string.ts";
import { String } from "./string.ts";
import { BinaryOperation } from "./binary.operation.ts";
import { UnaryOperation } from "./unary.operation.ts";
import { Parenthesis } from "./parenthesis.ts";
import { Power } from "./power.ts";
import { Number } from "./number.ts";
import { Dot } from "./dot.ts";
import { Token } from "./token.ts";
import { Constructor, assert } from "./constructor.ts";
import { Expression } from "./expression.ts";

export class Parser extends Tokenizer {
  constructor(public override input: string) {
    super(input);
  }

  private expectToken<T extends Token>(token: T, classConstructor: Constructor<T>, message?: string): T {
    if (!assert(token, classConstructor) && message) this.errors.push(message);
    return token;
  }

  parse() {
    return this.parseAddition();
  }

  private parseAddition() {
    let left = this.parseMultiplication();
    while (this.peekToken(Plus) || this.peekToken(Minus)) {
      const operator = this.parsePrimitive();
      const right = this.parseMultiplication();

      // assert right hand side expression
      this.expectToken(right, Expression, "Invalid right hand side expression in binary operation.");

      left = new BinaryOperation(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.peekToken(Multiplication) || this.peekToken(Division)) {
      const operator = this.parsePrimitive();
      const right = this.parsePower();
      left = new BinaryOperation(left, operator, right);
    }
    return left;
  }

  private parsePower(): Expression {
    let left = this.parseUnary();
    if (this.peekToken(Power)) {
      const operator = this.parsePrimitive();
      const right = this.parsePower();
      left = new BinaryOperation(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.peekToken(Plus) || this.peekToken(Minus)) {
      const operator = this.parsePrimitive();
      const right = this.parseUnary();
      return new UnaryOperation(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.peekToken(OpenParenthesis)) {
      const begin = this.parsePrimitive();
      const expression = this.parseAddition();
      const end = this.parsePrimitive();
      return new Parenthesis(begin, expression, end);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken(Quote)) {
      const begin = this.parsePrimitive();
      this.keepWhiteSpace();
      let value = "";
      while (this.hasMoreTokens()) {
        if (this.peekToken(Quote)) break;
        value += this.parsePrimitive().literal;
      }
      const string = new String(value);
      this.ignoreWhiteSpace();
      const end = this.expectToken(this.parsePrimitive(), Quote, "Missing '\"' in the end of string.");
      return new DoubleQuoteString(begin, string, end);
    }
    return this.parseNumber();
  }

  private parseNumber() {
    const left = this.parseIdentifier();
    if (assert(left, Number) && this.peekToken(Dot)) {
      left.literal = left.literal + this.parsePrimitive().literal + this.parsePrimitive().literal;
      return left;
    }
    return left;
  }

  private parseIdentifier() {
    const token = this.parsePrimitive();
    return token;
  }
}
