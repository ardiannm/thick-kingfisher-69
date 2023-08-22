import Expression from "./Expression";

export default class Parenthesis extends Expression {
  constructor(public gen: number, public expression: Expression) {
    super(gen);
  }
}
