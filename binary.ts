import { Expression, Operator } from "./language.ts";

export class Binary {
  constructor(
    public operator: Operator,
    public left: Expression,
    public right: Expression,
  ) {}
}
