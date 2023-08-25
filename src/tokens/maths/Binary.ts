import Expression from "../Expression";

export default class Binary extends Expression {
  constructor(public left: Expression, public right: Expression) {
    super();
  }
}
