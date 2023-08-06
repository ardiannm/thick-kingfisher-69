import Identifier from "./identifier.ts";
import TagProperties from "./tag.properties.ts";
import TokenInfo from "./token.info.ts";
import Tag from "./tag.ts";

export default class ClosingTag extends Tag {
  constructor(public tagName: Identifier, public properties: TagProperties, public info: TokenInfo) {
    super(info);
  }
}
