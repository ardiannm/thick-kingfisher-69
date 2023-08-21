import Identifier from "./identifier";
import Property from "./property";
import Tag from "./tag";

export default class OpenTag extends Tag {
  constructor(public id: number, public identifier: Identifier, public properties: Array<Property>) {
    super(id, identifier);
  }
}
