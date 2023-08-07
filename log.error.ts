import Token from "./token.ts";

export default class LogError {
  constructor(public message: string, public atToken?: Token) {
    this.message = `${this.constructor.name}: ${message}.`;
  }
}
