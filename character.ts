import TokenInfo from "./token.info.ts";
import Token from "./token.ts";

export default class Character extends Token {
  constructor(public string: string, public info: TokenInfo) {
    super(info);
  }
}
