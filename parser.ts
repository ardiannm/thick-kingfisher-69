import { Tokenizer } from "./tokenizer.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Expression } from "./language.ts";
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

export class Parser extends Tokenizer {
  constructor(public override input: string) {
    super(input);
  }

  parse() {
    return this.parseAddition();
  }

  private parseAddition() {
    let left = this.parseMultiplication() as Expression;
    while (this.testPeekToken(Plus) || this.testPeekToken(Minus)) {
      const operator = this.getNextToken();
      const right = this.parseMultiplication();
      left = new BinaryOperation(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parsePower();
    while (this.testPeekToken(Multiplication) || this.testPeekToken(Division)) {
      const operator = this.getNextToken();
      const right = this.parsePower();
      left = new BinaryOperation(left, operator, right);
    }
    return left;
  }

  private parsePower(): Expression {
    let left = this.parseUnary();
    if (this.testPeekToken(Power)) {
      const operator = this.getNextToken();
      const right = this.parsePower();
      left = new BinaryOperation(left, operator, right);
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.testPeekToken(Plus) || this.testPeekToken(Minus)) {
      const operator = this.getNextToken();
      const right = this.parseUnary();
      return new UnaryOperation(operator, right);
    }
    return this.parseParanthesis();
  }

  private parseParanthesis() {
    if (this.testPeekToken(OpenParenthesis)) {
      const begin = this.getNextToken();
      const expression = this.parseAddition();
      const end = this.getNextToken();
      return new Parenthesis(begin, expression, end);
    }
    return this.parseString();
  }

  private parseString() {
    if (this.testPeekToken(Quote)) {
      const begin = this.getNextToken();
      this.keepWhiteSpace();
      let value = "";
      while (this.hasMoreTokens()) {
        if (this.testPeekToken(Quote)) break;
        value += this.getNextToken().literal;
      }
      const string = new String(value);
      this.ignoreWhiteSpace();
      const end = this.expectToken(Quote, "Missing '\"' in the end of string.");
      return new DoubleQuoteString(begin, string, end);
    }
    return this.parseNumber();
  }

  private parseNumber() {
    const left = this.parseIdentifier();
    if (this.testToken(left, Number) && this.testPeekToken(Dot)) {
      left.literal = left.literal + this.getNextToken().literal + this.getNextToken().literal;
      return left;
    }
    return left;
  }

  private parseIdentifier() {
    const token = this.getNextToken();
    return token;
  }
}
