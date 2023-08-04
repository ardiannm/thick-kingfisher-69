import TokenInfo from "./token.info.ts";

export default class Token {
  public type = this.constructor.name
    .replace(/[A-Z]/g, (match) => ` ${match}`)
    .trim()
    .toLowerCase();
  constructor(public info: TokenInfo) {}
}
