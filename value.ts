import Expression from "./expression.ts";

export default class Value extends Expression {
  constructor(public source: string) {
    super();
  }
}
