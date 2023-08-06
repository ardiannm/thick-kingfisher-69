import HTML from "./html.ts";
import Identifier from "./identifier.ts";
import TokenInfo from "./token.info.ts";

export default class Tag extends HTML {
  constructor(public identifier: Identifier, public info: TokenInfo) {
    super(info);
  }
}
