import Expression from "./Expression";
import Program from "./Program";

export default class ImportStatement extends Expression {
  constructor(public path: string, public program: Program) {
    super();
  }
}
