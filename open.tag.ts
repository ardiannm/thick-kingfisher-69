import Property from "./property.ts";
import Tag from "./tag.ts";

export default class OpenTag extends Tag {
  constructor(public identifier: Identifier, public properties: Array<Property>, public from: number, public to: number) {
    super(identifier, from, to);
  }
}
