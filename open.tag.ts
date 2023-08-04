import Identifier from "./identifier.ts";
import Tag from "./tag.ts";

export default class OpenTag extends Tag {
  constructor(public name: Identifier = new Identifier(""), public properties: Array<Identifier> = []) {
    super();
  }
}
