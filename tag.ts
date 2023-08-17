import HTML from "./html.ts";
import Identifier from "./identifier.ts";

export default class Tag extends HTML {
  constructor(public id: number, public identifier: Identifier) {
    super(id);
  }
}
