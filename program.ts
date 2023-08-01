import Expression from "./expression.ts";

export default class Program extends Expression {
  constructor(public expressions: Array<Expression>) {
    super();
  }
}
