import Identifier from "./identifier.ts";
import TagProperties from "./tag.properties.ts";
import Tag from "./tag.ts";
import TokenInfo from "./token.info.ts";

export default class OpenTag extends Tag {
  constructor(public name: Identifier, public properties: TagProperties, public info: TokenInfo) {
    super(info);
  }
}
