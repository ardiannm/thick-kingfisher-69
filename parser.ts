import { Tokenizer } from "./tokenizer.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Binary } from "./binary.ts";
import { Expression, IdentifierOrNumber } from "./language.ts";

export class Parser extends Tokenizer {
  constructor(public input: string) {
    super(input);
  }

  parseAddition() {
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
