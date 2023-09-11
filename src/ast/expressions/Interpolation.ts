import Expression from "./Expression";

export default class Interpolation extends Expression {
  constructor(public strings: Array<Expression>) {
    super();
  }
}
