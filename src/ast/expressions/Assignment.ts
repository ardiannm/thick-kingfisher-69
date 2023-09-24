import Cell from "../spreadsheet/Cell";
import Expression from "./Expression";

export default class Assignment extends Expression {
  constructor(public assignee: Cell, public value: Expression, public refs: Array<string>) {
    super();
  }
}
