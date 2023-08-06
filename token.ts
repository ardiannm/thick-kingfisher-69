import TokenInfo from "./token.info.ts";

export default class Token {
  public token = this.constructor.name;
  constructor(public info: TokenInfo) {}
}
