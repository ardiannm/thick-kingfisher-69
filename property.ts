import HTML from "./html.ts";
import Identifier from "./identifier.ts";

export default class Property extends HTML {
  constructor(public identifier: Identifier, public value: string, public from: number, public to: number) {
    super(from, to);
  }
}
