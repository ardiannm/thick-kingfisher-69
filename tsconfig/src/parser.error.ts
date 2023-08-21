import LogError from "./log.error.ts";
import Token from "./token.ts";

export default class ParserError extends LogError {
  constructor(public message: string, public position: Token) {
    super(message);
  }
}
