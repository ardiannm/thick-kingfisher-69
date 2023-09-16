import System from "./System";

export default class SystemSpreadsheetCell extends System {
  constructor(public row: number, public column: number) {
    super();
  }
}
