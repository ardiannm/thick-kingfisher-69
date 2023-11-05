import Identifier from "../expressions/Identifier";

export default class Cell extends Identifier {
  constructor(public view: string, public column: string, public row: string) {
    super(view);
  }
}
