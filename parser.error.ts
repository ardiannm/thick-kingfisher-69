import ErrorMessage from "./log.error.ts";

export default class ParserError extends ErrorMessage {
  constructor(public message: string) {
    super(message);
  }
}
