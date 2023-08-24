import Expression from "./Expression";

export default class Unary extends Expression {
  constructor(public right: Expression) {
    super();
  }
}
