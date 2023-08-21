import Expression from "./Expression";

export default class Parenthesis extends Expression {
  constructor(public id: number, public expression: Expression) {
    super(id);
  }
}
