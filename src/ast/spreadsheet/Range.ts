import Spreadsheet from "./Spreadsheet";
import Cell from "./Cell";

export default class Range extends Spreadsheet {
  constructor(public left: Cell, public right: Cell) {
    super();
  }
}
