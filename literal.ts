import Expression from "./expression.ts";

export default class Literal extends Expression {
  constructor(public view: string) {
    super();
  }
}
