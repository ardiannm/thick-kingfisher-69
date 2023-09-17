import Expression from "./Expression";

export default class Parenthesis extends Expression {
  constructor(public expression: Expression) {
    super();
  }
}
