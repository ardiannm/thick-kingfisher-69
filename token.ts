import TokenInfo from "./token.info.ts";

export default class Token {
  public token = this.constructor.name;
  constructor(public info: TokenInfo) {}
  public formatName() {
    return this.token
      .replace(/[A-Z]/g, (match) => ` ${match}`)
      .trim()
      .toLowerCase();
  }
}
