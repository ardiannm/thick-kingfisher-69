import Token from "./Token";
import LogError from "./LogError";

export default class ParserError extends LogError {
  constructor(public message: string, public position: Token) {
    super(message);
  }
}
