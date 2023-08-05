import HTML from "./html.ts";
import Identifier from "./identifier.ts";
import TagProperties from "./tag.properties.ts";
import TokenInfo from "./token.info.ts";

export default class UnaryTag extends HTML {
  constructor(public tagName: Identifier, public properties: TagProperties, public info: TokenInfo) {
    super(info);
  }
}
