import { Tokenizer } from "./tokenizer.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Expression, IdentifierOrNumber } from "./language.ts";
import { Multiplication } from "./multiplication.ts";
import { Division } from "./division.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";
import { Quote } from "./quote.ts";
import { DoubleQuoteString } from "./double.quote.string.ts";
import { String } from "./string.ts";
import { BinaryOperation } from "./binary.operation.ts";
import { UnaryOperation } from "./unary.operation.ts";

export class Parser extends Tokenizer {
  constructor(public input: string) {
    super(input);
  }

  parseAddition() {
    let left = this.parseMultiplication() as Expression;
    while (
      this.peekToken() instanceof Multiplication ||
      this.peekToken() instanceof Division
    ) {
      const operator = this.getNextToken();
      const right = this.parseMultiplication();
      left = new BinaryOperation(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parseUnary();
    while (
      this.peekToken() instanceof Plus || this.peekToken() instanceof Minus
    ) {
      const operator = this.getNextToken();
      const right = this.parseUnary();
      left = new BinaryOperation(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (
      this.peekToken() instanceof Plus ||
      this.peekToken() instanceof Minus
    ) {
      const operator = this.getNextToken();
      const right = this.parseUnary();
      return new UnaryOperation(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis(): Expression {
    if (this.peekToken() instanceof OpenParenthesis) {
      this.getNextToken();
      const expression = this.parseAddition();
      this.getNextToken();
      return expression;
    }
    return this.parseString();
  }

  private parseString() {
    if (this.peekToken() instanceof Quote) {
      const begin = this.getNextToken();
      let value = "";
      while (this.hasMoreTokens()) {
        if (this.peekToken() instanceof Quote) break;
        value += this.getNextToken().value;
      }
      const string = new String(value);
      const end = this.getNextToken();
      return new DoubleQuoteString(begin, string, end);
    }
    return this.parseIdentifierOrNumber();
  }

  private parseIdentifierOrNumber(): IdentifierOrNumber {
    return this.getNextToken();
  }
}
