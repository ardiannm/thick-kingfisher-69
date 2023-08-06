import Identifier from "./identifier.ts";
import Properties from "./properties.ts";
import TokenInfo from "./token.info.ts";
import HTML from "./html.ts";

export default class ClosingTag extends HTML {
  constructor(public tagName: Identifier, public properties: Properties, public info: TokenInfo) {
    super(info);
  }
}
