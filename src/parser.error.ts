import Token from "./token";
import LogError from "./log.error";

export default class ParserError extends LogError {
  constructor(public message: string, public position: Token) {
    super(message);
  }
}
