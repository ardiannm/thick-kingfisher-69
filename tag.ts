import Expression from "./expression.ts";
import Identifier from "./identifier.ts";

export default class Tag extends Expression {
  constructor(public name: Identifier, public properties: string) {
    super();
  }
}
