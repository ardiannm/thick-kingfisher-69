import Identifier from "./Identifier";
import Attribute from "./Attribute";
import Tag from "./Tag";

export default class OpenTag extends Tag {
  constructor(public identifier: Identifier, public properties: Array<Attribute>) {
    super(identifier);
  }
}
