import TokenInfo from "./token.info.ts";
import Token from "./token.ts";

export default class Space extends Token {
  constructor(public raw: string, public info: TokenInfo) {
    super(info);
  }
}
