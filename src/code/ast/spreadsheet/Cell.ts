import Spreadsheet from "./Spreadsheet";

export default class Cell extends Spreadsheet {
  constructor(public column: string, public row: string) {
    super();
  }
}
