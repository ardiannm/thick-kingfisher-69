import Expression from "./expression";

export default class Literal extends Expression {
  constructor(public id: number, public view: string) {
    super(id);
  }
}
