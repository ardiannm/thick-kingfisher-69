import HTML from "./HTML";
import Identifier from "./Identifier";

export default class Tag extends HTML {
  constructor(public gen: number, public identifier: Identifier) {
    super(gen);
  }
}
