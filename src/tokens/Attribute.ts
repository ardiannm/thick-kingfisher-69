import Identifier from "./Identifier";
import HTML from "./HTML";

export default class Attribute extends HTML {
  constructor(public property: Identifier, public value: string) {
    super();
  }
}
