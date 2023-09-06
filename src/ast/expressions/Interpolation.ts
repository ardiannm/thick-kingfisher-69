import Expression from "./Expression";

export default class Interpolation extends Expression {
  constructor(public expressions: Array<Expression>) {
    super();
  }
}
