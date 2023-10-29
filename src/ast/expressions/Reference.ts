import Expression from "./Expression";

export default class Reference extends Expression {
  constructor(public name: string, public expression: Expression, public referencedBy: Array<Reference>) {
    super();
  }
}
