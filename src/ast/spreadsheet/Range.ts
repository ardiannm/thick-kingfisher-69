import Cell from "./Cell";
import Identifier from "../expressions/Identifier";

export default class Range extends Identifier {
  constructor(public left: Cell, public right: Cell) {
    const view = left.view + right.view;
    super(view);
  }
}
