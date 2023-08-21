import Expression from "./expression";

export default class Program extends Expression {
  constructor(public id: number, public expressions: Array<Expression>) {
    super(id);
  }
}
