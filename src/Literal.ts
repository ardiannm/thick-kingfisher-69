import Expression from "./Expression";

export default class Literal extends Expression {
  constructor(public gen: number, public view: string) {
    super(gen);
  }
}
