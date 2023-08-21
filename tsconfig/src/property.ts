import HTML from "./html.ts";
import Identifier from "./identifier.ts";

export default class Property extends HTML {
  constructor(public id: number, public identifier: Identifier, public value: string) {
    super(id);
  }
}
