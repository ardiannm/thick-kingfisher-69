import TokenInfo from "./token.info.ts";

export default class Token {
  private token = this.constructor.name;
  constructor(public info: TokenInfo) {}

  public name() {
    return this.token;
  }

  public formatName() {
    return this.token
      .replace(/[A-Z]/g, (match) => ` ${match}`)
      .trim()
      .toLowerCase();
  }
}
