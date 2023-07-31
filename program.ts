import { Expression } from "./expression.ts";

export class Program extends Expression {
  constructor(public expressions: Array<Expression>) {
    super();
  }
}
