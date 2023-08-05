import HTML from "./html.ts";
import OpenTag from "./open.tag.ts";
import TokenInfo from "./token.info.ts";

export default class Component extends HTML {
  constructor(public tag: OpenTag, public innerText: Array<HTML>, public info: TokenInfo) {
    super(info);
  }
}
