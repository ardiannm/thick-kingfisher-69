import Expression from "./Expression";

export default class Program extends Expression {
  constructor(public gen: number, public expressions: Array<Expression>) {
    super(gen);
  }
}
