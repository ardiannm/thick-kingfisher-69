import System from "./System";
import SystemSpreadsheetCell from "./SystemSpreadsheetCell";

export default class SystemSpreadsheetRange extends System {
  constructor(public row: SystemSpreadsheetCell, public column: SystemSpreadsheetCell) {
    super();
  }
}
