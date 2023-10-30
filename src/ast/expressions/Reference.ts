import Expression from "./Expression";

export default class Reference extends Expression {
  constructor(public reference: string, public expression: Expression, public referencing: Set<string>, public referencedBy: Set<string>) {
    super();
  }
}
