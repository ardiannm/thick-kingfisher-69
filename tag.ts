import Expression from "./expression.ts";
import Identifier from "./identifier.ts";

export default class Tag extends Expression {
  constructor(public name: Identifier = new Identifier(""), public properties: Array<Identifier> = []) {
    super();
  }
}
