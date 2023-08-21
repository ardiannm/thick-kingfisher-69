import Expression from "./expression.ts";

export default class Program extends Expression {
  constructor(public id: number, public expressions: Array<Expression>) {
    super(id);
  }
}
