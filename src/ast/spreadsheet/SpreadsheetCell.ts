import Expression from "../expressions/Expression";

export default class SpreadsheetCell extends Expression {
  constructor(public column: string, public row: string) {
    super();
  }
}
