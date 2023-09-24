import Expression from "./Expression";

export default class Assignment extends Expression {
  constructor(public assignee: Expression, public value: Expression) {
    super();
  }
}
