import HTML from "./html.ts";
import Identifier from "./identifier.ts";

export default class Tag extends HTML {
  constructor(public identifier: Identifier, public from: number, public to: number) {
    super(from, to);
  }
}
