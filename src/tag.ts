import HTML from "./html";
import Identifier from "./identifier";


export default class Tag extends HTML {
  constructor(public id: number, public identifier: Identifier) {
    super(id);
  }
}
