import Expression from "./expression.ts";

export default class Value extends Expression {
  constructor(public raw: string, public from: number, public to: number) {
    super(from, to);
  }
}
