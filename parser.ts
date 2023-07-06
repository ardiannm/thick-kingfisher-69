import { Tokenizer } from "./tokenizer.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Binary } from "./binary.ts";
import { Expression, IdentifierOrNumber } from "./language.ts";
import { Multiplication } from "./multiplication.ts";
import { Division } from "./division.ts";

export class Parser extends Tokenizer {
  constructor(public input: string) {
    super(input);
  }

  parseAddition() {
    let left = this.parseMultiplication() as Expression;
    while (
      this.peekToken() instanceof Multiplication || this.peekToken() instanceof Division
    ) {
      const operator = this.getNextToken();
      const right = this.parseMultiplication();
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseMultiplication() {
    let left = this.parseIdentifierOrNumber() as Expression;
    while (
      this.peekToken() instanceof Plus || this.peekToken() instanceof Minus
    ) {
      const operator = this.getNextToken();
      const right = this.parseIdentifierOrNumber();
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseIdentifierOrNumber(): IdentifierOrNumber {
    return this.getNextToken();
  }
}
