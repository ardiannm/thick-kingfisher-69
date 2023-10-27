import Expression from "./Expression";

export default class Observable extends Expression {
  constructor(public reference: string, public expression: Expression, public observing: Set<string>) {
    super();
  }
}
