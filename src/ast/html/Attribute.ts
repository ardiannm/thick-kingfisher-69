import HTML from "./HTML";

export default class Attribute extends HTML {
  constructor(public property: string, public value: string) {
    super();
  }
}
