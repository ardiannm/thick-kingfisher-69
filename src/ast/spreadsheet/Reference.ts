import Expression from "../expressions/Expression";

export default class Reference extends Expression {
  constructor(public reference: string, public expression: Expression, public observing: Array<string>) {
    super();
  }
}
