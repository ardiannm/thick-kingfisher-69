import { Expression, Operator } from "./language.ts";
import { Token } from "./token.ts";

export class BinaryOperation extends Token {
  constructor(
    public left: Expression,
    public operator: Operator,
    public right: Expression,
  ) {
    super()
  }
}
