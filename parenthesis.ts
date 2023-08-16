import Expression from "./expression.ts";

export default class Parenthesis extends Expression {
  constructor(public expression: Expression) {
    super();
  }
}
