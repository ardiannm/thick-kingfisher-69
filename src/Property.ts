import Identifier from "./Identifier";
import HTML from "./HTML";

export default class Property extends HTML {
  constructor(public id: number, public identifier: Identifier, public raw: string) {
    super(id);
  }
}
