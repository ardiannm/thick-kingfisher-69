import Identifier from "./Identifier";
import Property from "./Property";
import Tag from "./Tag";

export default class OpenTag extends Tag {
  constructor(public gen: number, public identifier: Identifier, public properties: Array<Property>) {
    super(gen, identifier);
  }
}
