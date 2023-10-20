import Expression from "./Expression";

export default class Observable extends Expression {
  constructor(public reference: string, public value: Expression, public formula: string) {
    super();
  }
}
