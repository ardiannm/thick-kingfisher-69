import Expression from "./Expression";
import Program from "./Program";

export default class Import extends Expression {
  constructor(public path: string, public module: string) {
    super();
  }
}
