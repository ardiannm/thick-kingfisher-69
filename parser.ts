import { Tokenizer } from "./tokenizer.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Binary } from "./binary.ts";
import { Expression, IdentifierOrNumber } from "./language.ts";
import { Multiplication } from "./multiplication.ts";
import { Division } from "./division.ts";
import { OpenParenthesis } from "./open.parenthesis.ts";

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
      left = new Binary(operator, left, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parseParanthesis() as Expression;
    while (
      this.peekToken() instanceof Plus || this.peekToken() instanceof Minus
    ) {
      const operator = this.getNextToken();
      const right = this.parseParanthesis();
      left = new Binary(operator, left, right);
    }
    return left;
  }

  private parseParanthesis() {
    if (this.peekToken() instanceof OpenParenthesis) {
      this.getNextToken();
      const expression = this.parseAddition();
      this.getNextToken();
      return expression;
    }
    return this.parseIdentifierOrNumber();
  }

  private parseIdentifierOrNumber(): IdentifierOrNumber {
    return this.getNextToken();
  }
}
