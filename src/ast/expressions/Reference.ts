import Expression from "./Expression";

export default class Reference extends Expression {
  constructor(public name: string, public expression: Expression, public referencing: Set<string> /* Set<Reference> */) {
    super();
  }
}
