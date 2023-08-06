import Identifier from "./identifier.ts";
import TagProperties from "./tag.properties.ts";
import Tag from "./tag.ts";
import TokenInfo from "./token.info.ts";

export default class UnaryTag extends Tag {
  constructor(public tagName: Identifier, public properties: TagProperties, public info: TokenInfo) {
    super(info);
  }
}
