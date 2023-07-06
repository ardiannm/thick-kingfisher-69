import { Tokenizer } from "./tokenizer.ts";
import { Plus } from "./plus.ts";
import { Minus } from "./minus.ts";
import { Binary } from "./binary.ts";
import { Identifier } from "./identifier.ts";
import { Number } from "./number.ts";

export class Parser extends Tokenizer {
  constructor(public input: string) {
    super(input);
  }

  parse() {
    return this.parseAddition();
  }

  private parseAddition() {
    let left = this.parseBasic();
    while (
      this.peekToken() instanceof Plus || this.peekToken() instanceof Minus
    ) {
      const operator = this.getNextToken();
      const right = this.parseBasic();
      left = new Binary(left, operator, right);
    }
    return left;
  }

  private parseBasic(): Identifier | Number {
    return this.getNextToken();
  }
}
