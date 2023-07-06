import { Expression, Operator } from "./language.ts";
import { Token } from "./token.ts";

export class UnaryOperation extends Token {
  constructor(
    public operator: Operator,
    public right: Expression,
  ) {
    super();
  }
}
