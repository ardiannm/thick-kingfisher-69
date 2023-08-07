import HTML from "./html.ts";
import TokenInfo from "./token.info.ts";

export default class Component extends HTML {
  constructor(public identifier: string, public components: Array<HTML>, public info: TokenInfo) {
    super(info);
  }
}
