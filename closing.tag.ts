import HTML from "./html.ts";
import Identifier from "./identifier.ts";
import TagProperties from "./tag.properties.ts";
import TokenInfo from "./token.info.ts";

export default class ClosingTag extends HTML {
  constructor(public name: Identifier, public properties: TagProperties, public info: TokenInfo) {
    super(info);
  }
}
