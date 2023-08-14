import Token from "./token.ts";

export default class ParserError {
  constructor(public message: string, public atPosition: Token) {
    this.message = `${this.constructor.name}: ${message}, at position ${atPosition.from}`;
  }
}
