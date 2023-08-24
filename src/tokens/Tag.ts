import HTML from "./HTML";
import Identifier from "./Identifier";

export default class Tag extends HTML {
  constructor(public identifier: Identifier) {
    super();
  }
}
