import Template from "./template.ts";
import OpenTag from "./open.tag.ts";
import TokenInfo from "./token.info.ts";

export default class Component extends Template {
  constructor(public tag: OpenTag, public innerText: Array<Template>, public info: TokenInfo) {
    super(info);
  }
}
