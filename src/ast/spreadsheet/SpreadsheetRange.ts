import Expression from "../expressions/Expression";
import SpreadsheetCell from "./SpreadsheetCell";

export default class SpreadsheetRange extends Expression {
  constructor(public left: SpreadsheetCell, public right: SpreadsheetCell) {
    super();
  }
}
