import Expression from "./Expression";

export default class Reference extends Expression {
  constructor(public name: string, public expression: Expression, public observing: Array<string>, public observers: Array<string>) {
    super();
  }
}
