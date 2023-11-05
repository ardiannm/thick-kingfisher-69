import Cell from "./Cell";
import Identifier from "../expressions/Identifier";

export default class Range extends Identifier {
  constructor(public view: string, public left: Cell, public right: Cell) {
    super(view);
  }
}
