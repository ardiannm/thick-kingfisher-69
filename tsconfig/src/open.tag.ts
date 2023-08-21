import Identifier from "./identifier.ts";
import Property from "./property.ts";
import Tag from "./tag.ts";

export default class OpenTag extends Tag {
  constructor(public id: number, public identifier: Identifier, public properties: Array<Property>) {
    super(id, identifier);
  }
}
