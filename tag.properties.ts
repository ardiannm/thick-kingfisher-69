import Template from "./template.ts";
import TokenInfo from "./token.info.ts";

export default class TagProperties extends Template {
  constructor(public raw: string, public info: TokenInfo) {
    super(info);
  }
}
