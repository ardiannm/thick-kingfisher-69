import HTML from "./html.ts";
import TokenInfo from "./token.info.ts";

export default class Properties extends HTML {
  constructor(public raw: string, public info: TokenInfo) {
    super(info);
  }
}
