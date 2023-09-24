import Expression from "./Expression";
import Identifier from "./Identifier";

export default class Assignment extends Expression {
  constructor(public assignee: Identifier, public value: Expression, public refs: Array<string>) {
    super();
  }
}
