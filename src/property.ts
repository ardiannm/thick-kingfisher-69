import Identifier from "./identifier";
import HTML from "./html";

export default class Property extends HTML {
  constructor(public id: number, public identifier: Identifier, public value: string) {
    super(id);
  }
}
