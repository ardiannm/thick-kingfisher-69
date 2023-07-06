import { Expression, Operator } from "./language.ts";

export class Unary {
  constructor(
    public operator: Operator,
    public right: Expression,
  ) {}
}
