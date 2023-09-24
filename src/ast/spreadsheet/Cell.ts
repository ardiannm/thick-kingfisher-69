import Identifier from "../expressions/Identifier";

export default class Cell extends Identifier {
  constructor(public column: string, public row: string) {
    const view = column + row;
    super(view);
  }
}
