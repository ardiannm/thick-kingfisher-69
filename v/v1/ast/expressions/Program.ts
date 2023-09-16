import Expression from "./Expression";

export default class Program extends Expression {
  constructor(public expressions: Array<Expression>) {
    super();
  }
}
