import HTML from "./html.ts";
import TokenInfo from "./token.info.ts";

export default class Content extends HTML {
  constructor(public raw: string, public info: TokenInfo) {
    super(info);
  }
}
