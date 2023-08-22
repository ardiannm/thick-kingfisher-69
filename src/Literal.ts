import Expression from "./Expression";

export default class Literal extends Expression {
  constructor(public view: string) {
    super();
  }
}
