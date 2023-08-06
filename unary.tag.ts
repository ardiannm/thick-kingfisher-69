import Identifier from "./identifier.ts";
import Properties from "./properties.ts";
import HTML from "./html.ts";
import TokenInfo from "./token.info.ts";

export default class UnaryTag extends HTML {
  constructor(public tagName: Identifier, public properties: Properties, public info: TokenInfo) {
    super(info);
  }
}
